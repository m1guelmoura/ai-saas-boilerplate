# AI SaaS Boilerplate

Um boilerplate completo e profissional para criar aplicações SaaS com IA. Construído com Next.js 14, TypeScript, Supabase e Stripe.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Shadcn UI
- **Backend/Auth**: Supabase (Auth + Postgres)
- **Pagamentos**: Stripe (Subscriptions)
- **Ícones**: Lucide React

## 📁 Estrutura do Projeto

```
ai-saas-boilerplate/
├── app/                    # App Router (Next.js 14)
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Landing page
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes UI (Shadcn)
│   └── landing/          # Componentes da landing page
├── lib/                   # Utilitários e helpers
│   └── utils.ts          # Funções utilitárias
└── types/                 # Definições TypeScript
```

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📝 Próximos Passos

- [ ] Configurar Supabase
- [ ] Configurar Stripe
- [ ] Implementar autenticação
- [ ] Criar dashboard
- [ ] Adicionar testes

## 📄 Licença

Este projeto é um boilerplate comercial. Consulte os termos de licença no seu plano de compra.
