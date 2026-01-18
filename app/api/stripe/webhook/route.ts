import { NextRequest, NextResponse } from "next/server";
import { stripe, getStripeWebhookSecret } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 * 
 * Critical: This route verifies the webhook signature for security
 * 
 * Note: We use request.text() to get raw body for signature verification
 * In Next.js App Router, this automatically disables body parsing
 */
export const runtime = "nodejs"; // Ensure we're running on Node.js runtime

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        getStripeWebhookSecret()
      );
    } catch (err) {
      const error = err as Error;
      console.error("Webhook signature verification failed:", error.message);
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only handle subscription mode
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await syncSubscriptionToDatabase(
            subscription,
            session.customer as string,
            session // Pass session for fallback lookups
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          await syncSubscriptionToDatabase(
            subscription,
            invoice.customer as string,
            null // No session available for invoice events
          );
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToDatabase(
          subscription,
          subscription.customer as string,
          null // No session available for subscription events
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to sync Stripe subscription to Supabase database
 * 
 * CRITICAL: Handles "First Time Subscriber" flow using client_reference_id
 * 
 * Flow:
 * 1. Try to find user by stripe_customer_id (existing subscriptions)
 * 2. IF NOT FOUND: Use client_reference_id from session to find user directly in auth.users
 * 3. Once found, immediately UPDATE the user's subscription record with stripe_customer_id
 * 4. Then proceed to create/update the subscription
 */
async function syncSubscriptionToDatabase(
  subscription: Stripe.Subscription,
  stripeCustomerId: string,
  session: Stripe.Checkout.Session | null
) {
  try {
    // Get the price ID from the subscription
    const priceId =
      typeof subscription.items.data[0]?.price.id === "string"
        ? subscription.items.data[0].price.id
        : "";

    // Map Stripe status to our database status
    const status = mapStripeStatusToDatabase(subscription.status);

    // Step 1: Try to find user by stripe_customer_id (existing subscriptions)
    let { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", stripeCustomerId)
      .single();

    let userId: string | null = existingSubscription?.user_id || null;

    // Step 2: CRITICAL FALLBACK - Use client_reference_id to find user directly
    if (!userId && session?.client_reference_id) {
      console.log(
        `User not found by stripe_customer_id, using client_reference_id: ${session.client_reference_id}`
      );
      
      // Verify user exists in auth.users by ID
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
        session.client_reference_id
      );

      if (authUser?.user && !authError) {
        userId = authUser.user.id;
        console.log(`Found user via client_reference_id: ${userId}`);
        
        // CRITICAL: Immediately update/create the subscription record with stripe_customer_id
        // This ensures future webhook calls can find the user by stripe_customer_id
        // Check if subscription record exists for this user
        const { data: existingUserSub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        // Use upsert to safely handle existing records and avoid duplicate key errors
        // Check if stripe_customer_id already exists for a different user
        const { data: existingCustomerSub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, stripe_subscription_id")
          .eq("stripe_customer_id", stripeCustomerId)
          .maybeSingle();

        if (existingCustomerSub && existingCustomerSub.user_id !== userId) {
          // stripe_customer_id already exists for a different user
          // This shouldn't happen in normal flow, but handle gracefully
          console.warn(
            `stripe_customer_id ${stripeCustomerId} already exists for user ${existingCustomerSub.user_id}, but we found user ${userId} via client_reference_id`
          );
          // Use the existing user_id instead
          userId = existingCustomerSub.user_id;
        } else {
          // Check if subscription record already exists for this user
          const { data: existingUserSub } = await supabaseAdmin
            .from("subscriptions")
            .select("id, stripe_customer_id")
            .eq("user_id", userId)
            .maybeSingle();

          if (existingUserSub) {
            // Update existing record with stripe_customer_id if it's different
            if (existingUserSub.stripe_customer_id !== stripeCustomerId) {
              const { error: updateError } = await supabaseAdmin
                .from("subscriptions")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("id", existingUserSub.id);

              if (updateError) {
                // Check if it's a duplicate key error (23505)
                const errorCode = (updateError as any)?.code;
                if (errorCode === "23505" || (updateError as any)?.message?.includes("23505")) {
                  // Duplicate key error - stripe_customer_id already exists for another record
                  // This is fine, just log and continue
                  console.log(
                    `stripe_customer_id ${stripeCustomerId} already exists elsewhere, but record for user ${userId} exists. Continuing...`
                  );
                } else {
                  console.error("Error updating subscription with stripe_customer_id:", updateError);
                }
              } else {
                console.log(`Updated subscription record with stripe_customer_id for user ${userId}`);
              }
            } else {
              console.log(`Subscription record already has correct stripe_customer_id for user ${userId}`);
            }
          } else {
            // No existing record - try to insert, but handle duplicate key errors gracefully
            const { error: insertError } = await supabaseAdmin
              .from("subscriptions")
              .insert({
                user_id: userId,
                stripe_customer_id: stripeCustomerId,
                status: "incomplete",
                price_id: "", // Will be updated below
              });

            if (insertError) {
              // Check if it's a duplicate key error (23505)
              const errorCode = (insertError as any)?.code;
              if (errorCode === "23505" || (insertError as any)?.message?.includes("23505")) {
                // Duplicate key error - stripe_customer_id already exists
                // This means another record has this customer_id, which is fine
                // The final upsert below will handle it
                console.log(
                  `stripe_customer_id ${stripeCustomerId} already exists, will be handled by final upsert`
                );
              } else {
                console.error("Error inserting subscription with stripe_customer_id:", insertError);
                // Continue anyway - we'll try to upsert the full record below
              }
            } else {
              console.log(`Created subscription record with stripe_customer_id for user ${userId}`);
            }
          }
        }
      } else {
        console.error(
          `User not found in auth.users with id: ${session.client_reference_id}`,
          authError
        );
      }
    }

    // If still no user found, log error and return
    if (!userId) {
      console.error(
        `No user found for Stripe customer: ${stripeCustomerId}. ` +
        `Tried: stripe_customer_id and client_reference_id (${session?.client_reference_id || "N/A"}).`
      );
      return;
    }

    // Step 3: Upsert full subscription data
    // CRITICAL: Check for existing record by stripe_customer_id first to avoid 23505 error
    // Since both stripe_customer_id and stripe_subscription_id are UNIQUE, we need to handle both
    
    // First, check if a record exists with this stripe_customer_id
    const { data: existingByCustomerId } = await supabaseAdmin
      .from("subscriptions")
      .select("id, stripe_subscription_id, user_id")
      .eq("stripe_customer_id", stripeCustomerId)
      .maybeSingle();

    // Also check by stripe_subscription_id
    const { data: existingBySubscriptionId } = await supabaseAdmin
      .from("subscriptions")
      .select("id, stripe_customer_id, user_id")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();

    const existingRecord = existingByCustomerId || existingBySubscriptionId;

    if (existingRecord) {
      // Record exists - update it to avoid duplicate key error
      console.log(
        `Found existing subscription record (id: ${existingRecord.id}), updating instead of inserting...`
      );

      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscription.id,
          status: status,
          price_id: priceId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        })
        .eq("id", existingRecord.id);

      if (updateError) {
        console.error("Error updating existing subscription:", updateError);
        throw updateError;
      }

      console.log(`Updated subscription record (id: ${existingRecord.id}) successfully`);
    } else {
      // No existing record - safe to insert
      // Use upsert with onConflict on stripe_subscription_id as fallback
      const { error: insertError } = await supabaseAdmin
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: subscription.id,
            status: status,
            price_id: priceId,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
          },
          {
            onConflict: "stripe_subscription_id",
          }
        );

      if (insertError) {
        // Check if it's a duplicate key error (23505) for stripe_customer_id
        const errorCode = (insertError as any)?.code;
        const errorMessage = (insertError as any)?.message || "";

        if (
          errorCode === "23505" ||
          errorMessage.includes("23505") ||
          errorMessage.includes("duplicate key") ||
          errorMessage.includes("stripe_customer_id")
        ) {
          // Race condition: record was created between our check and insert
          // Find and update it
          console.log(
            `Duplicate key error detected (race condition), finding and updating existing record...`
          );

          const { data: raceConditionRecord } = await supabaseAdmin
            .from("subscriptions")
            .select("id")
            .eq("stripe_customer_id", stripeCustomerId)
            .maybeSingle();

          if (raceConditionRecord) {
            const { error: updateError } = await supabaseAdmin
              .from("subscriptions")
              .update({
                user_id: userId,
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: subscription.id,
                status: status,
                price_id: priceId,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                canceled_at: subscription.canceled_at
                  ? new Date(subscription.canceled_at * 1000).toISOString()
                  : null,
              })
              .eq("id", raceConditionRecord.id);

            if (updateError) {
              console.error("Error updating record after race condition:", updateError);
              throw updateError;
            }

            console.log(`Updated record after race condition (id: ${raceConditionRecord.id})`);
          } else {
            // Should not happen, but handle gracefully
            console.error("Duplicate key error but record not found - this should not happen");
            throw insertError;
          }
        } else {
          // Other error - throw it
          console.error("Error inserting subscription:", insertError);
          throw insertError;
        }
      } else {
        console.log(`Inserted new subscription record successfully`);
      }
    }

    console.log(
      `Synced subscription ${subscription.id} for customer ${stripeCustomerId} (user_id: ${userId})`
    );
  } catch (error) {
    console.error("Error in syncSubscriptionToDatabase:", error);
    throw error;
  }
}

/**
 * Map Stripe subscription status to our database status
 */
function mapStripeStatusToDatabase(
  stripeStatus: Stripe.Subscription.Status
): string {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    trialing: "trialing",
    incomplete: "incomplete",
    incomplete_expired: "incomplete_expired",
    unpaid: "unpaid",
    paused: "paused",
  };

  return statusMap[stripeStatus] || "incomplete";
}
