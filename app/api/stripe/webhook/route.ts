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
 * This function handles the "First Time Subscriber" flow by using fallbacks:
 * 1. Try to find user by stripe_customer_id
 * 2. Fallback 1: Try to find user by client_reference_id (Supabase User ID) from session
 * 3. Fallback 2: Try to find user by email from Stripe customer
 * 
 * Once user is found, the stripe_customer_id is saved to ensure future lookups work.
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

    // Step 1: Try to find user by stripe_customer_id
    let { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", stripeCustomerId)
      .single();

    let userId: string | null = existingSubscription?.user_id || null;

    // Step 2: Fallback 1 - Try to find user by client_reference_id (Supabase User ID)
    if (!userId && session?.client_reference_id) {
      console.log(
        `User not found by stripe_customer_id, trying client_reference_id: ${session.client_reference_id}`
      );
      
      const { data: userSubscription } = await supabaseAdmin
        .from("subscriptions")
        .select("user_id")
        .eq("user_id", session.client_reference_id)
        .single();

      if (userSubscription) {
        userId = userSubscription.user_id;
        console.log(`Found user via client_reference_id: ${userId}`);
      }
    }

    // Step 3: Fallback 2 - Try to find user by metadata or email from Stripe customer
    if (!userId) {
      console.log(
        `User not found by client_reference_id, trying Stripe customer metadata/email for: ${stripeCustomerId}`
      );
      
      try {
        // Retrieve customer from Stripe to get metadata and email
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        
        if (customer && !customer.deleted) {
          // First, try to get user_id from customer metadata (set during checkout)
          if (
            customer.metadata &&
            typeof customer.metadata.supabase_user_id === "string"
          ) {
            const metadataUserId = customer.metadata.supabase_user_id;
            console.log(`Found supabase_user_id in customer metadata: ${metadataUserId}`);
            
            // Verify user exists and get/create subscription record
            const { data: userSubscription } = await supabaseAdmin
              .from("subscriptions")
              .select("user_id")
              .eq("user_id", metadataUserId)
              .single();

            if (userSubscription) {
              userId = userSubscription.user_id;
              console.log(`Found user via customer metadata: ${userId}`);
            } else {
              // User exists in auth but no subscription record - use the metadata user_id
              userId = metadataUserId;
              console.log(`Using user_id from customer metadata, creating subscription record: ${userId}`);
            }
          }
          
          // If still no user found, try email lookup
          if (!userId && typeof customer.email === "string") {
            console.log(`Trying email lookup: ${customer.email}`);
            
            // Get user from Supabase auth by email
            // Note: listUsers() doesn't support email filtering, so we search in the results
            const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
            
            const matchingUser = authUsers.users.find(
              (u) => u.email?.toLowerCase() === customer.email.toLowerCase()
            );

            if (matchingUser) {
              // Check if user has a subscription record
              const { data: userSubscription } = await supabaseAdmin
                .from("subscriptions")
                .select("user_id")
                .eq("user_id", matchingUser.id)
                .single();

              if (userSubscription) {
                userId = userSubscription.user_id;
                console.log(`Found user via email: ${userId}`);
              } else {
                // User exists in auth but no subscription record - create one
                userId = matchingUser.id;
                console.log(`Found user via email, creating subscription record: ${userId}`);
              }
            }
          }
        }
      } catch (stripeError) {
        console.error(
          `Error retrieving customer from Stripe: ${stripeError}`
        );
      }
    }

    // If still no user found, log error and return
    if (!userId) {
      console.error(
        `No user found for Stripe customer: ${stripeCustomerId}. ` +
        `Tried: stripe_customer_id, client_reference_id (${session?.client_reference_id || "N/A"}), and email lookup.`
      );
      return;
    }

    // Step 4: Upsert subscription data and ensure stripe_customer_id is saved
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          stripe_customer_id: stripeCustomerId, // CRITICAL: Save stripe_customer_id for future lookups
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
