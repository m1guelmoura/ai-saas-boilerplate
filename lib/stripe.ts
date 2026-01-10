import Stripe from "stripe";

/**
 * Stripe client initialization
 * Server-side only - uses secret key from environment variables
 */
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia", // Stripe API version - update as needed
  typescript: true,
});

/**
 * Get Stripe publishable key (for client-side)
 */
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables");
  }
  return key;
}

/**
 * Get Stripe webhook secret (for webhook verification)
 */
export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
  }
  return secret;
}
