"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Action: Sign in with email and password
 */
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      error: "Email e senha são obrigatórios",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Server Action: Sign up with email and password
 */
export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return {
      error: "Email e senha são obrigatórios",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "As senhas não coincidem",
    };
  }

  if (password.length < 6) {
    return {
      error: "A senha deve ter pelo menos 6 caracteres",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Verifique seu email para confirmar sua conta",
  };
}

/**
 * Server Action: Sign out
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Server Action: Sign in with Google OAuth
 * Initiates OAuth flow and returns the redirect URL
 * Note: We return the URL instead of redirecting directly because
 * server actions with redirect() can have issues with client components
 */
export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  if (data.url) {
    return {
      url: data.url,
    };
  }

  return {
    error: "Falha ao iniciar autenticação Google",
  };
}

/**
 * Server Action: Request password reset
 */
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      error: "Email é obrigatório",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Email de recuperação enviado! Verifique sua caixa de entrada.",
  };
}

/**
 * Server Action: Update password
 */
export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return {
      error: "Senha e confirmação são obrigatórias",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "As senhas não coincidem",
    };
  }

  if (password.length < 6) {
    return {
      error: "A senha deve ter pelo menos 6 caracteres",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
