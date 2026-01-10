/**
 * Type definitions for the AI SaaS Boilerplate
 */

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Subscription types
export interface Subscription {
  id: string;
  user_id: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  plan_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

// Plan types
export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
}
