import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

/**
 * Reset Password Page
 * User lands here after clicking the reset link in their email
 * Requires a valid reset token in the URL
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string; type?: string; hash?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if we have a valid reset token
  // Supabase handles the token via the URL hash/token
  const hasToken = searchParams.token || searchParams.hash || searchParams.type === "recovery";

  if (!hasToken) {
    redirect("/forgot-password");
  }

  // If user is already authenticated but doesn't have a reset token, redirect
  // This page should only be accessible via the email link
  if (user && !hasToken) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Redefinir Senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digite sua nova senha abaixo
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
