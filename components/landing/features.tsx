import {
  Shield,
  Zap,
  Code,
  Database,
  CreditCard,
  Smartphone,
  Lock,
  Rocket,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Features Section Component
 * Grid layout showcasing key features
 */
const features = [
  {
    icon: Zap,
    title: "Performance Otimizada",
    description:
      "Construído com Next.js 14 e App Router para máxima performance e SEO.",
  },
  {
    icon: Shield,
    title: "Segurança em Primeiro Lugar",
    description:
      "Autenticação robusta com Supabase e proteção contra vulnerabilidades comuns.",
  },
  {
    icon: Code,
    title: "TypeScript Completo",
    description:
      "100% tipado para melhor DX e menos bugs em produção.",
  },
  {
    icon: Database,
    title: "Backend Pronto",
    description:
      "Integração completa com Supabase (Postgres, Auth, Storage).",
  },
  {
    icon: CreditCard,
    title: "Pagamentos Integrados",
    description:
      "Stripe configurado para assinaturas recorrentes e gerenciamento de planos.",
  },
  {
    icon: Smartphone,
    title: "Totalmente Responsivo",
    description:
      "Design mobile-first que funciona perfeitamente em todos os dispositivos.",
  },
  {
    icon: Lock,
    title: "Privacidade & Compliance",
    description:
      "Estrutura preparada para GDPR e outras regulamentações de privacidade.",
  },
  {
    icon: Rocket,
    title: "Deploy Instantâneo",
    description:
      "Configurado para deploy rápido na Vercel ou sua plataforma preferida.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tudo que você precisa para começar
          </h2>
          <p className="text-lg text-muted-foreground">
            Um boilerplate completo com todas as funcionalidades essenciais
            para uma aplicação SaaS moderna.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
