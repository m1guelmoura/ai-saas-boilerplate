import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * Error page for authentication code errors
 * Shown when email confirmation or OAuth callback fails
 */
export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Erro na autenticação</CardTitle>
                <CardDescription>
                  Não foi possível confirmar sua conta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O link de confirmação pode ter expirado ou já foi usado. Por
              favor, tente fazer login novamente ou solicite um novo link de
              confirmação.
            </p>
          </CardContent>
          <CardContent className="flex gap-4">
            <Link href="/login" className="flex-1">
              <Button className="w-full">Ir para Login</Button>
            </Link>
            <Link href="/signup" className="flex-1">
              <Button variant="outline" className="w-full">
                Criar Nova Conta
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
