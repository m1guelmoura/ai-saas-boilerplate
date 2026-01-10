"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

/**
 * Pricing Section Component
 * Monthly/Yearly toggle with pricing cards
 */
const pricingPlans = {
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
    },
  ],
};

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = pricingPlans[billingCycle];

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
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
