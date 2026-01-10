import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth/signup-form";

/**
 * Signup Page
 * Redirects to dashboard if user is already authenticated
 */
export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect if already authenticated
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Criar conta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Preencha os dados para começar
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
