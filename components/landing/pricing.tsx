"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Check } from "lucide-react";

/**
 * Pricing Section Component
 * Monthly/Yearly toggle with pricing cards
 * 
 * Note: priceId should match your Stripe Price IDs
 * Set these in your .env.local file as NEXT_PUBLIC_STRIPE_PRICE_ID_*
 * Example: NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=price_xxxxx
 */
interface PricingPlan {
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  priceId?: string; // Stripe Price ID
  isEnterprise?: boolean; // Enterprise plans might need custom handling
}

// Get price IDs from environment variables
// These NEXT_PUBLIC_ variables are available in client components after build
// Set them in your .env.local file
const PRICE_IDS = {
  STARTER_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY,
  PROFESSIONAL_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY,
  ENTERPRISE_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY,
  STARTER_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY,
  PROFESSIONAL_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_YEARLY,
  ENTERPRISE_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY,
};

const pricingPlans: {
  monthly: PricingPlan[];
  yearly: PricingPlan[];
} = {
  monthly: [
    {
      name: "Starter",
      price: "$99",
      description: "Perfeito para projetos pessoais",
      features: [
        "Código fonte completo",
        "Documentação detalhada",
        "Suporte por email",
        "Atualizações por 6 meses",
        "Licença para 1 projeto",
      ],
      cta: "Comprar Agora",
      popular: false,
      priceId: PRICE_IDS.STARTER_MONTHLY,
    },
    {
      name: "Professional",
      price: "$299",
      description: "Para equipes e startups",
      features: [
        "Tudo do Starter",
        "Suporte prioritário",
        "Atualizações por 12 meses",
        "Licença para 3 projetos",
        "Sessão de onboarding",
        "Acesso a comunidade privada",
      ],
      cta: "Comprar Agora",
      popular: true,
      priceId: PRICE_IDS.PROFESSIONAL_MONTHLY,
    },
    {
      name: "Enterprise",
      price: "$999",
      description: "Para empresas e agências",
      features: [
        "Tudo do Professional",
        "Suporte 24/7",
        "Atualizações vitalícias",
        "Licença ilimitada",
        "Onboarding dedicado",
        "Customizações sob medida",
        "SLA garantido",
      ],
      cta: "Falar com Vendas",
      popular: false,
      isEnterprise: true,
      priceId: PRICE_IDS.ENTERPRISE_MONTHLY,
    },
  ],
  yearly: [
    {
      name: "Starter",
      price: "$899",
      originalPrice: "$1,188",
      description: "Perfeito para projetos pessoais",
      features: [
        "Código fonte completo",
        "Documentação detalhada",
        "Suporte por email",
        "Atualizações por 6 meses",
        "Licença para 1 projeto",
      ],
      cta: "Comprar Agora",
      popular: false,
      priceId: PRICE_IDS.STARTER_YEARLY,
    },
    {
      name: "Professional",
      price: "$2,699",
      originalPrice: "$3,588",
      description: "Para equipes e startups",
      features: [
        "Tudo do Starter",
        "Suporte prioritário",
        "Atualizações por 12 meses",
        "Licença para 3 projetos",
        "Sessão de onboarding",
        "Acesso a comunidade privada",
      ],
      cta: "Comprar Agora",
      popular: true,
      priceId: PRICE_IDS.PROFESSIONAL_YEARLY,
    },
    {
      name: "Enterprise",
      price: "$8,999",
      originalPrice: "$11,988",
      description: "Para empresas e agências",
      features: [
        "Tudo do Professional",
        "Suporte 24/7",
        "Atualizações vitalícias",
        "Licença ilimitada",
        "Onboarding dedicado",
        "Customizações sob medida",
        "SLA garantido",
      ],
      cta: "Falar com Vendas",
      popular: false,
      isEnterprise: true,
      priceId: PRICE_IDS.ENTERPRISE_YEARLY,
    },
  ],
};

export function Pricing() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plans = pricingPlans[billingCycle];

  /**
   * Handle subscription checkout
   */
  const handleSubscribe = async (plan: PricingPlan) => {
    // Enterprise plans might need custom handling (contact sales)
    if (plan.isEnterprise || !plan.priceId) {
      // For enterprise, you might want to open a contact form or email
      window.location.href = "mailto:sales@yourcompany.com?subject=Enterprise Plan Inquiry";
      return;
    }

    setLoading(plan.name);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          router.push("/login?redirect=pricing");
          return;
        }
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error creating checkout session:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="bg-muted/50 py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Preços Simples e Transparentes
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Escolha o plano ideal para suas necessidades. Todos os planos
            incluem o código fonte completo.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 rounded-lg border bg-background p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual
              <span className="ml-2 text-xs text-green-600">Economize 25%</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-md bg-destructive/10 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all hover:shadow-xl ${
                plan.popular
                  ? "border-2 border-primary shadow-lg scale-105"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Mais Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {billingCycle === "yearly" && (
                    <>
                      <span className="text-muted-foreground">/ano</span>
                      {plan.originalPrice && (
                        <div className="mt-1">
                          <span className="text-sm text-muted-foreground line-through">
                            {plan.originalPrice}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {billingCycle === "monthly" && (
                    <span className="text-muted-foreground">/mês</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading !== null}
                >
                  {loading === plan.name ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Processando...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
