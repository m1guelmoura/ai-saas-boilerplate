import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client using the service role key
 * This client bypasses RLS (Row Level Security) and should ONLY be used server-side
 * for operations like webhooks that need to modify data on behalf of any user
 * 
 * WARNING: Never expose the service role key to the client!
 */
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set in environment variables");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
