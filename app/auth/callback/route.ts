import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

/**
 * Callback route for Supabase Auth
 * Handles email confirmation, OAuth callbacks, and password reset
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next");

  // Determine redirect destination based on callback type
  let redirectTo = "/dashboard";
  if (type === "recovery") {
    // Password reset - redirect to reset password page
    redirectTo = "/auth/reset-password";
  } else if (next) {
    // Custom redirect
    redirectTo = next;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";

      // Include the code in the redirect URL for password reset to work properly
      let finalRedirectUrl = redirectTo;
      if (type === "recovery") {
        finalRedirectUrl = `${redirectTo}?code=${code}&type=${type}`;
      }

      if (isLocalEnv) {
        return NextResponse.redirect(`${requestUrl.origin}${finalRedirectUrl}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${finalRedirectUrl}`);
      } else {
        return NextResponse.redirect(`${requestUrl.origin}${finalRedirectUrl}`);
      }
    }
  }

  // Handle hash-based auth (for password reset links that use hash fragments)
  // Note: Hash fragments are not sent to the server, so we handle them client-side
  // For password reset, the token is in the hash, so we need to redirect to the reset page
  // and let the client-side handle it
  if (type === "recovery") {
    const redirectUrl = `${requestUrl.origin}${redirectTo}${requestUrl.search}`;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";
    
    if (isLocalEnv) {
      return NextResponse.redirect(redirectUrl);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${redirectTo}${requestUrl.search}`);
    } else {
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`);
}
