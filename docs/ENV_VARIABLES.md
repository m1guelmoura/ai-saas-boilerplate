# Variáveis de Ambiente Necessárias

Este documento lista todas as variáveis de ambiente necessárias para o projeto.

## Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App URL (for redirects and callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (Subscription Plans)
# Create products and prices in Stripe Dashboard, then add the Price IDs here
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_YEARLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_xxxxx
```

## Como Obter as Chaves

### Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **Settings** → **API**
3. Copie `URL` (NEXT_PUBLIC_SUPABASE_URL)
4. Copie `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. Copie `service_role` key (SUPABASE_SERVICE_ROLE_KEY) - **CUIDADO: Nunca exponha essa chave!**

### Stripe
1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Vá em **Developers** → **API keys**
3. Copie `Secret key` (STRIPE_SECRET_KEY) - use `sk_test_...` para desenvolvimento
4. Copie `Publishable key` (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) - use `pk_test_...` para desenvolvimento
5. Para obter o webhook secret:
   - Vá em **Developers** → **Webhooks**
   - Clique em **Add endpoint**
   - URL: `https://yourdomain.com/api/stripe/webhook` (ou use Stripe CLI para desenvolvimento local)
   - Selecione os eventos: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copie o `Signing secret` (STRIPE_WEBHOOK_SECRET)

### Stripe Price IDs
1. No Stripe Dashboard, vá em **Products**
2. Crie produtos para cada plano (Starter, Professional, Enterprise)
3. Para cada produto, crie preços (monthly e yearly)
4. Copie os **Price IDs** (começam com `price_`) e adicione às variáveis de ambiente correspondentes

## Para Desenvolvimento Local

Para testar webhooks localmente, use o Stripe CLI:

```bash
# Instale o Stripe CLI
brew install stripe/stripe-cli/stripe

# Faça login
stripe login

# Escute eventos localmente (isso retorna um webhook secret)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

O comando acima retornará um `whsec_...` que você deve usar como `STRIPE_WEBHOOK_SECRET` no `.env.local`.

## Produção

Para produção:
- Use chaves de produção (`sk_live_...` e `pk_live_...`)
- Configure `NEXT_PUBLIC_APP_URL` para seu domínio de produção
- Configure o webhook endpoint no Stripe Dashboard apontando para `https://yourdomain.com/api/stripe/webhook`
- Use as variáveis de ambiente no seu provedor de deploy (Vercel, etc.)
