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

        if (existingUserSub) {
          // Update existing record with stripe_customer_id
          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update({ stripe_customer_id: stripeCustomerId })
            .eq("user_id", userId);

          if (updateError) {
            console.error("Error updating subscription with stripe_customer_id:", updateError);
            // Continue anyway - we'll try to upsert the full record below
          } else {
            console.log(`Updated subscription record with stripe_customer_id for user ${userId}`);
          }
        } else {
          // Create new record with stripe_customer_id (minimal data, will be updated below)
          const { error: createError } = await supabaseAdmin
            .from("subscriptions")
            .insert({
              user_id: userId,
              stripe_customer_id: stripeCustomerId,
              status: "incomplete",
              price_id: "", // Will be updated below
            });

          if (createError) {
            console.error("Error creating subscription record with stripe_customer_id:", createError);
            // Continue anyway - we'll try to upsert the full record below
          } else {
            console.log(`Created subscription record with stripe_customer_id for user ${userId}`);
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

    // Step 3: Upsert full subscription data (stripe_customer_id already saved above if needed)
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          stripe_customer_id: stripeCustomerId, // CRITICAL: Ensure stripe_customer_id is saved
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

    if (error) {
      console.error("Error syncing subscription to database:", error);
      throw error;
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
