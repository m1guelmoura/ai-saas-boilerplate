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

          await syncSubscriptionToDatabase(subscription, session.customer as string);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          await syncSubscriptionToDatabase(subscription, invoice.customer as string);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToDatabase(subscription, subscription.customer as string);
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
 */
async function syncSubscriptionToDatabase(
  subscription: Stripe.Subscription,
  stripeCustomerId: string
) {
  try {
    // Get the price ID from the subscription
    const priceId =
      typeof subscription.items.data[0]?.price.id === "string"
        ? subscription.items.data[0].price.id
        : "";

    // Map Stripe status to our database status
    const status = mapStripeStatusToDatabase(subscription.status);

    // Find user by stripe_customer_id
    const { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", stripeCustomerId)
      .single();

    if (!existingSubscription) {
      console.error(`No user found for Stripe customer: ${stripeCustomerId}`);
      return;
    }

    // Upsert subscription data
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: existingSubscription.user_id,
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

    if (error) {
      console.error("Error syncing subscription to database:", error);
      throw error;
    }

    console.log(`Synced subscription ${subscription.id} for customer ${stripeCustomerId}`);
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
