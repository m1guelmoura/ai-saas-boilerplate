# Guia de Deploy - AI SaaS Boilerplate

Este guia fornece instruções passo a passo para fazer deploy do projeto na Vercel.

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Conta no [Stripe](https://stripe.com)
- [Git](https://git-scm.com) instalado localmente
- [Node.js](https://nodejs.org) 18+ instalado localmente

---

## 🚀 Passo 1: Preparar o Repositório no GitHub

### 1.1 Criar um novo repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Clique em "New repository"
3. Dê um nome ao repositório (ex: `ai-saas-boilerplate`)
4. Escolha se será público ou privado
5. **NÃO** inicialize com README, .gitignore ou licença (já temos esses arquivos)
6. Clique em "Create repository"

### 1.2 Conectar o projeto local ao GitHub

```bash
# No diretório do projeto
cd /caminho/para/ai-saas-boilerplate

# Verificar se já existe um repositório Git
git status

# Se não existir, inicializar
git init

# Adicionar todos os arquivos
git add .

# Criar commit inicial
git commit -m "Initial commit: AI SaaS Boilerplate ready for production"

# Adicionar o repositório remoto (substitua YOUR_USERNAME e YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Verificar a branch atual (deve ser main ou master)
git branch

# Se necessário, renomear para main
git branch -M main

# Fazer push para o GitHub
git push -u origin main
```

---

## 🔧 Passo 2: Configurar Supabase

### 2.1 Criar projeto no Supabase

1. Acesse [Supabase](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha:
   - **Name**: Nome do projeto
   - **Database Password**: Senha forte para o banco
   - **Region**: Escolha a região mais próxima
4. Aguarde o projeto ser criado (2-3 minutos)

### 2.2 Executar Migration SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em "New Query"
3. Copie e cole o conteúdo do arquivo `supabase/migrations/01_stripe_subscriptions.sql`
4. Clique em "Run" para executar a migration
5. Verifique se a tabela `subscriptions` foi criada em **Table Editor**

### 2.3 Obter chaves do Supabase

1. Vá em **Settings** → **API**
2. Anote os seguintes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NUNCA EXPONHA ESTA CHAVE!**

### 2.4 Configurar Google OAuth (opcional mas recomendado)

1. No Supabase Dashboard, vá em **Authentication** → **Providers**
2. Clique em **Google**
3. Habilite o provedor Google
4. Você precisará criar um projeto no [Google Cloud Console](https://console.cloud.google.com):
   - Crie um projeto OAuth 2.0
   - Adicione `https://your-project.supabase.co/auth/v1/callback` como Redirect URI
   - Copie o **Client ID** e **Client Secret**
5. Cole o Client ID e Secret no Supabase
6. Salve as configurações

---

## 💳 Passo 3: Configurar Stripe

### 3.1 Criar conta no Stripe

1. Acesse [Stripe](https://stripe.com) e crie uma conta
2. Complete o onboarding inicial

### 3.2 Obter chaves da API

1. No Stripe Dashboard, vá em **Developers** → **API keys**
2. Anote os seguintes valores:
   - **Secret key** (começa com `sk_test_...`) → `STRIPE_SECRET_KEY`
   - **Publishable key** (começa com `pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

⚠️ **Nota**: Use chaves de teste (`sk_test_` e `pk_test_`) para desenvolvimento. Para produção, use chaves live (`sk_live_` e `pk_live_`).

### 3.3 Criar produtos e preços

1. No Stripe Dashboard, vá em **Products**
2. Crie produtos para cada plano (Starter, Professional, Enterprise)
3. Para cada produto, crie preços:
   - **Starter**: Mensal e Anual
   - **Professional**: Mensal e Anual
   - **Enterprise**: Mensal e Anual
4. Anote os **Price IDs** (começam com `price_...`) para cada preço

### 3.4 Configurar Customer Portal

1. No Stripe Dashboard, vá em **Settings** → **Billing** → **Customer portal**
2. Configure as funcionalidades disponíveis:
   - Permitir cancelamento de assinatura
   - Permitir atualização de método de pagamento
   - Permitir visualização de histórico de pagamentos
3. Customize a aparência conforme necessário
4. Salve as configurações

### 3.5 Configurar Webhook

1. No Stripe Dashboard, vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. URL do endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
   - ⚠️ **Importante**: Use seu domínio de produção. Para desenvolvimento local, use Stripe CLI.
4. Selecione os eventos para escutar:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Clique em **Add endpoint**
6. Copie o **Signing secret** (começa com `whsec_...`) → `STRIPE_WEBHOOK_SECRET`

---

## 🌐 Passo 4: Deploy na Vercel

### 4.1 Conectar repositório à Vercel

1. Acesse [Vercel](https://vercel.com) e faça login
2. Clique em "Add New..." → "Project"
3. Selecione o repositório do GitHub que você criou
4. Clique em "Import"

### 4.2 Configurar o projeto

1. **Project Name**: Escolha um nome (ou deixe o padrão)
2. **Framework Preset**: Next.js (deve ser detectado automaticamente)
3. **Root Directory**: `.` (raiz do projeto)
4. **Build Command**: `npm run build` (padrão)
5. **Output Directory**: `.next` (padrão)
6. **Install Command**: `npm install` (padrão)

### 4.3 Adicionar Variáveis de Ambiente

**CRÍTICO**: Adicione todas as variáveis de ambiente antes de fazer deploy!

No painel da Vercel, vá em **Environment Variables** e adicione:

#### Supabase (3 variáveis)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### App URL (1 variável)
```
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```
⚠️ **Nota**: Após o primeiro deploy, atualize esta URL com seu domínio final.

#### Stripe (3 variáveis)
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Stripe Price IDs (6 variáveis)
```
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_YEARLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_xxxxx
```

**Total: 13 variáveis de ambiente**

### 4.4 Fazer Deploy

1. Clique em **Deploy**
2. Aguarde o build completar (2-5 minutos)
3. Se houver erros, verifique os logs no painel da Vercel

---

## ✅ Passo 5: Verificações Pós-Deploy

### 5.1 Atualizar URLs de Redirecionamento

Após o primeiro deploy, você precisa atualizar:

1. **Supabase**:
   - Vá em **Authentication** → **URL Configuration**
   - Adicione sua URL de produção em **Site URL** e **Redirect URLs**
   - Exemplo: `https://your-project.vercel.app`

2. **Stripe Webhook**:
   - Atualize a URL do webhook para sua URL de produção
   - Exemplo: `https://your-project.vercel.app/api/stripe/webhook`

3. **Variável de Ambiente**:
   - Atualize `NEXT_PUBLIC_APP_URL` na Vercel com sua URL final

### 5.2 Testar Funcionalidades

Teste cada funcionalidade após o deploy:

- [ ] **Autenticação**: Login, Signup, Logout
- [ ] **Google OAuth**: Login com Google
- [ ] **Recuperação de Senha**: Request e Reset
- [ ] **Checkout Stripe**: Criar assinatura
- [ ] **Webhooks Stripe**: Verificar se eventos estão sendo processados
- [ ] **Customer Portal**: Gerenciar assinatura
- [ ] **Dashboard**: Ver status de assinatura

### 5.3 Verificar Logs

1. Na Vercel, vá em **Deployments**
2. Clique no deployment mais recente
3. Veja os logs para erros ou avisos
4. Monitore **Functions** para erros em runtime

---

## 🔒 Passo 6: Produção (Opcional mas Recomendado)

### 6.1 Mudar para Chaves Live do Stripe

1. No Stripe Dashboard, ative sua conta para pagamentos reais
2. Gere chaves **live** (`sk_live_` e `pk_live_`)
3. Atualize as variáveis de ambiente na Vercel:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Crie produtos e preços com valores reais
5. Atualize os Price IDs nas variáveis de ambiente

### 6.2 Configurar Domínio Personalizado

1. Na Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar DNS
4. Aguarde a propagação DNS (pode levar até 24 horas)
5. Atualize `NEXT_PUBLIC_APP_URL` com o domínio personalizado

### 6.3 Habilitar SSL/HTTPS

- ✅ A Vercel fornece SSL automaticamente via Let's Encrypt
- Não é necessária configuração adicional

---

## 🐛 Troubleshooting

### Erro: "STRIPE_SECRET_KEY is not set"
- **Solução**: Verifique se todas as variáveis de ambiente foram adicionadas na Vercel

### Erro: "Invalid webhook signature"
- **Solução**: Verifique se o `STRIPE_WEBHOOK_SECRET` está correto e corresponde ao endpoint configurado

### Webhooks não funcionando
- **Solução**: 
  1. Verifique se a URL do webhook está correta no Stripe
  2. Verifique se o webhook secret está correto
  3. Teste localmente com Stripe CLI primeiro

### Erro de autenticação Supabase
- **Solução**: 
  1. Verifique se as chaves do Supabase estão corretas
  2. Verifique se as URLs de redirecionamento estão configuradas

### Erro de build na Vercel
- **Solução**: 
  1. Verifique os logs do build na Vercel
  2. Teste o build localmente: `npm run build`
  3. Verifique se não há erros de TypeScript: `npm run lint`

---

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Stripe](https://stripe.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)

---

## 🎉 Próximos Passos

Após o deploy bem-sucedido:

1. Configure Google Analytics (opcional)
2. Configure monitoramento de erros (Sentry, etc.)
3. Configure backups do banco de dados Supabase
4. Configure alertas para webhooks falhando
5. Configure métricas de performance

---

**Desenvolvido por:** Auto (IA Assistant)  
**Data:** 2024  
**Versão:** 1.0.0
