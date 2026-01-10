# Integração Stripe - Guia Completo

Este documento descreve a implementação completa da integração Stripe para subscrições recorrentes.

## 📋 O Que Foi Implementado

### 1. Database Schema ✅
- **Arquivo:** `supabase/migrations/01_stripe_subscriptions.sql`
- Tabela `subscriptions` criada com todos os campos necessários
- RLS (Row Level Security) configurado
- Índices criados para performance
- Triggers para atualização automática de timestamps

### 2. Stripe SDK Initialization ✅
- **Arquivo:** `lib/stripe.ts`
- Cliente Stripe inicializado com TypeScript
- Funções helper para obter chaves do ambiente

### 3. Supabase Admin Client ✅
- **Arquivo:** `lib/supabase/admin.ts`
- Cliente Supabase com service_role key
- Bypassa RLS para operações de webhook
- ⚠️ **IMPORTANTE:** Nunca exponha essa chave ao cliente!

### 4. API Routes ✅

#### Checkout Route
- **Arquivo:** `app/api/stripe/checkout/route.ts`
- Cria sessões de checkout do Stripe
- Verifica autenticação do usuário
- Cria ou recupera Stripe Customer ID
- Retorna URL de checkout

#### Webhook Route
- **Arquivo:** `app/api/stripe/webhook/route.ts`
- ✅ **Verificação de assinatura webhook** (CRÍTICO para segurança)
- Processa eventos:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Sincroniza dados com Supabase automaticamente

#### Portal Route
- **Arquivo:** `app/api/stripe/portal/route.ts`
- Cria sessões do Customer Portal
- Permite que usuários gerenciem assinaturas (cancelar, atualizar método de pagamento, etc.)

### 5. Frontend Integration ✅

#### Pricing Component
- **Arquivo:** `components/landing/pricing.tsx`
- Botões de checkout integrados
- Loading states
- Error handling
- Suporte para planos Enterprise (contact sales)

#### Dashboard
- **Arquivo:** `app/dashboard/page.tsx`
- Exibe status da assinatura atual
- Mostra data de renovação
- Botão "Gerenciar Assinatura" para abrir Customer Portal
- Diferentes estados visuais (ativo, trial, cancelado, etc.)

#### Manage Subscription Button
- **Arquivo:** `components/dashboard/manage-subscription-button.tsx`
- Componente client-side para abrir Customer Portal
- Loading e error states

### 6. TypeScript Types ✅
- **Arquivo:** `types/index.ts`
- Interface `Subscription` atualizada com todos os campos
- Tipos seguros para status de assinatura

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente

Consulte `docs/ENV_VARIABLES.md` para a lista completa de variáveis necessárias.

**Variáveis críticas:**
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Stripe Dashboard Setup

1. **Criar Produtos e Preços:**
   - Crie produtos para cada plano (Starter, Professional, Enterprise)
   - Para cada produto, crie preços mensais e anuais
   - Copie os Price IDs (começam com `price_`)

2. **Configurar Webhooks:**
   - Vá em **Developers** → **Webhooks**
   - Clique em **Add endpoint**
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Eventos a selecionar:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copie o **Signing secret** (começa com `whsec_`)

3. **Configurar Customer Portal:**
   - Vá em **Settings** → **Billing** → **Customer portal**
   - Configure as funcionalidades disponíveis
   - Customize a aparência conforme necessário

### 3. Executar Migration SQL

Execute a migration SQL no Supabase:

```bash
# Via Supabase Dashboard SQL Editor
# Copie e cole o conteúdo de supabase/migrations/01_stripe_subscriptions.sql
```

Ou via CLI:
```bash
supabase migration up
```

## 🚀 Fluxo de Funcionamento

### 1. Checkout Flow
1. Usuário clica em "Comprar Agora" na página de pricing
2. Frontend chama `/api/stripe/checkout` com `priceId`
3. API cria ou recupera Stripe Customer
4. API cria Checkout Session
5. Usuário é redirecionado para Stripe Checkout
6. Após pagamento bem-sucedido, Stripe envia webhook

### 2. Webhook Flow
1. Stripe envia evento para `/api/stripe/webhook`
2. API verifica assinatura do webhook (segurança)
3. API processa o evento e atualiza Supabase
4. Subscription sincronizada automaticamente

### 3. Customer Portal Flow
1. Usuário clica em "Gerenciar Assinatura" no dashboard
2. Frontend chama `/api/stripe/portal`
3. API cria Portal Session
4. Usuário é redirecionado para Stripe Customer Portal
5. Após alterações, Stripe envia webhook para atualizar

## 🔒 Segurança

### Verificação de Webhook
A verificação da assinatura do webhook é **CRÍTICA** para segurança. Sem ela, qualquer pessoa poderia enviar eventos falsos.

✅ **Implementado:** A rota de webhook verifica a assinatura usando `stripe.webhooks.constructEvent()`

### Row Level Security (RLS)
- Usuários só podem ler suas próprias assinaturas
- Service role (usado em webhooks) bypassa RLS automaticamente
- ⚠️ Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` ao cliente!

### Variáveis de Ambiente
- Secrets nunca devem ser commitados no git
- Use `.env.local` para desenvolvimento
- Configure variáveis no ambiente de produção

## 🧪 Testando Localmente

### 1. Usar Stripe CLI para Webhooks

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escutar eventos localmente
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

O comando acima retornará um `whsec_...` - use isso como `STRIPE_WEBHOOK_SECRET` no `.env.local`.

### 2. Testar Checkout

1. Configure variáveis de ambiente
2. Execute o servidor: `npm run dev`
3. Acesse a página de pricing
4. Clique em "Comprar Agora"
5. Use cartão de teste: `4242 4242 4242 4242`
6. Complete o checkout

### 3. Testar Webhooks

```bash
# No terminal com Stripe CLI rodando
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

## 📊 Status de Assinatura

A tabela `subscriptions` armazena os seguintes status:

- `active` - Assinatura ativa
- `trialing` - Período de teste
- `past_due` - Pagamento pendente
- `canceled` - Cancelada
- `incomplete` - Incompleta (primeiro pagamento falhou)
- `incomplete_expired` - Incompleta expirada
- `unpaid` - Não paga
- `paused` - Pausada

## 🔄 Próximos Passos

- [ ] Implementar upgrade/downgrade de planos
- [ ] Adicionar histórico de transações
- [ ] Implementar trial automático para novos usuários
- [ ] Adicionar notificações de email para eventos importantes
- [ ] Criar página de sucesso/cancelamento personalizada
- [ ] Implementar métricas de receita no dashboard

## 📚 Recursos Úteis

- [Stripe Subscriptions Docs](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## ⚠️ Notas Importantes

1. **Price IDs:** Certifique-se de que os Price IDs no código correspondem aos criados no Stripe Dashboard
2. **Webhook Secret:** Diferente para desenvolvimento (Stripe CLI) e produção
3. **Test Mode:** Use `sk_test_` e `pk_test_` para desenvolvimento, `sk_live_` e `pk_live_` para produção
4. **Customer Portal:** Configure no Stripe Dashboard antes de usar
5. **RLS:** A policy permite que usuários leiam apenas suas próprias assinaturas

---

**Desenvolvido por:** Auto (IA Assistant)  
**Data:** 2024
