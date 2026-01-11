"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * FAQ Section Component
 * Accordion-based FAQ section
 */
const faqs = [
  {
    question: "O que está incluído no boilerplate?",
    answer:
      "O boilerplate inclui Next.js 14 com TypeScript, autenticação com Supabase, integração com Stripe para pagamentos, dashboard completo, componentes UI com Shadcn, Tailwind CSS configurado, e toda a estrutura necessária para uma aplicação SaaS moderna.",
  },
  {
    question: "Posso usar em projetos comerciais?",
    answer:
      "Sim! Todos os planos incluem licença para uso comercial. O plano Starter permite 1 projeto, Professional permite 3 projetos, e Enterprise permite uso ilimitado.",
  },
  {
    question: "Preciso de conhecimento técnico avançado?",
    answer:
      "O boilerplate foi projetado para ser acessível, mas recomendamos conhecimento básico de React, TypeScript e Next.js. Incluímos documentação detalhada e exemplos para facilitar o desenvolvimento.",
  },
  {
    question: "Como funciona o suporte?",
    answer:
      "Oferecemos suporte por email para todos os planos. O plano Professional inclui suporte prioritário, e o Enterprise oferece suporte 24/7 com SLA garantido.",
  },
  {
    question: "Recebo atualizações?",
    answer:
      "Sim! O plano Starter inclui 6 meses de atualizações, Professional inclui 12 meses, e Enterprise inclui atualizações vitalícias com todas as melhorias e correções.",
  },
  {
    question: "Posso customizar o código?",
    answer:
      "Absolutamente! Você recebe o código fonte completo e pode modificá-lo como desejar. O boilerplate é seu para personalizar e adaptar às suas necessidades.",
  },
  {
    question: "Há algum custo recorrente além da compra?",
    answer:
      "Não! Você paga uma vez e recebe o código. Os únicos custos recorrentes serão os serviços que você escolher usar (Supabase, Stripe, Vercel, etc.), que são cobrados diretamente por esses provedores.",
  },
  {
    question: "Oferecem reembolso?",
    answer:
      "Oferecemos garantia de 30 dias. Se não estiver satisfeito, entre em contato e faremos o reembolso completo, sem perguntas.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Encontre respostas para as dúvidas mais comuns sobre nosso
            boilerplate.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" defaultValue="0">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={index.toString()}>
                <AccordionTrigger value={index.toString()}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent value={index.toString()}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
