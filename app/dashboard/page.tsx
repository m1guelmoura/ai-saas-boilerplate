import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, CreditCard, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { ManageSubscriptionButton } from "@/components/dashboard/manage-subscription-button";
import { Subscription } from "@/types";
import Link from "next/link";

/**
 * Dashboard Page (Protected)
 * Displays user information, subscription status, and provides logout functionality
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's subscription
  // Note: If subscription doesn't exist, it will return null (not an error)
  // This is expected for users without subscriptions
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no subscription exists

  const userSubscription = subscription as Subscription | null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="mt-2 text-muted-foreground">
                Bem-vindo de volta, {user.email}
              </p>
            </div>
            <form action={signOut}>
              <Button type="submit" variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>

          {/* Subscription Status Card */}
          {userSubscription && userSubscription.status === "active" ? (
            <Card className="mb-8 border-green-500/50 bg-green-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-green-500">
                        Assinatura Ativa
                      </CardTitle>
                      <CardDescription>
                        Plano atual: {getPlanName(userSubscription.price_id)}
                      </CardDescription>
                    </div>
                  </div>
                  <ManageSubscriptionButton />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userSubscription.current_period_end && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Renovação
                      </p>
                      <p className="text-lg">
                        {new Date(userSubscription.current_period_end).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {userSubscription.cancel_at_period_end && (
                        <p className="mt-2 text-sm text-amber-600">
                          ⚠️ Sua assinatura será cancelada na data de renovação
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : userSubscription && userSubscription.status === "trialing" ? (
            <Card className="mb-8 border-blue-500/50 bg-blue-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-blue-500">Período de Teste</CardTitle>
                    <CardDescription>
                      Você está testando nosso serviço gratuitamente
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {userSubscription.current_period_end && (
                  <p className="text-sm text-muted-foreground">
                    O período de teste termina em{" "}
                    {new Date(userSubscription.current_period_end).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : userSubscription && ["past_due", "unpaid"].includes(userSubscription.status) ? (
            <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-amber-500">
                        Pagamento Pendente
                      </CardTitle>
                      <CardDescription>
                        Por favor, atualize seu método de pagamento
                      </CardDescription>
                    </div>
                  </div>
                  <ManageSubscriptionButton />
                </div>
              </CardHeader>
            </Card>
          ) : userSubscription && userSubscription.status === "canceled" ? (
            <Card className="mb-8 border-gray-500/50 bg-gray-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500/10">
                    <XCircle className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-500">
                      Assinatura Cancelada
                    </CardTitle>
                    <CardDescription>
                      Sua assinatura foi cancelada
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ) : (
            <Card className="mb-8 border-amber-500/50 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                      <CreditCard className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle>Sem Assinatura</CardTitle>
                      <CardDescription>
                        Escolha um plano para começar
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/#pricing">
                    <Button>
                      Ver Planos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Bem-vindo de volta!</CardTitle>
                  <CardDescription>
                    Você está logado com sucesso
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg">{user.email}</p>
                </div>
                {user.user_metadata?.name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nome
                    </p>
                    <p className="text-lg">{user.user_metadata.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ID do Usuário
                  </p>
                  <p className="text-sm font-mono text-muted-foreground">
                    {user.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for future content */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
                <CardDescription>
                  Configure sua aplicação SaaS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {!userSubscription || userSubscription.status !== "active" ? (
                    <>
                      <li>• Escolha um plano de assinatura</li>
                      <li>• Configure seu método de pagamento</li>
                    </>
                  ) : (
                    <>
                      <li>• Explore todas as funcionalidades</li>
                      <li>• Configure seu perfil</li>
                    </>
                  )}
                  <li>• Consulte a documentação</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos</CardTitle>
                <CardDescription>
                  Funcionalidades disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Autenticação completa</li>
                  <li>• Dashboard protegido</li>
                  {userSubscription && userSubscription.status === "active" && (
                    <li>• Acesso completo às funcionalidades</li>
                  )}
                  <li>• Mais em breve...</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to get plan name from price ID
 * This is a simple mapping - you might want to fetch from Stripe or database
 */
function getPlanName(priceId: string): string {
  // Map Stripe Price IDs to plan names
  // Update these to match your actual Stripe Price IDs
  const planMap: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY || ""]: "Starter",
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY || ""]: "Professional",
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY || ""]: "Enterprise",
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY || ""]: "Starter (Anual)",
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_YEARLY || ""]: "Professional (Anual)",
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY || ""]: "Enterprise (Anual)",
  };

  return planMap[priceId] || "Plano Personalizado";
}
