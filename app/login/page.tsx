import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

/**
 * Login Page
 * Redirects to dashboard if user is already authenticated
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirectedFrom?: string; error?: string };
}) {
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
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre na sua conta para continuar
          </p>
          {searchParams.redirectedFrom && (
            <p className="mt-2 text-sm text-amber-600">
              Você precisa estar logado para acessar essa página
            </p>
          )}
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
