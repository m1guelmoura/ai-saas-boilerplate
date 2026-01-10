import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User } from "lucide-react";

/**
 * Dashboard Page (Protected)
 * Displays user information and provides logout functionality
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
                  <li>• Configure seu perfil</li>
                  <li>• Escolha um plano</li>
                  <li>• Explore as funcionalidades</li>
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
