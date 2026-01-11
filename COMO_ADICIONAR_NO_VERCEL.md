# Como Adicionar Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE

**O Vercel NÃO permite importar arquivos .env diretamente!**

Você precisa adicionar as variáveis **MANUALMENTE** uma por uma no painel da Vercel.

---

## 📋 Passo a Passo

### 1. Acesse o Painel da Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione seu projeto (ou crie um novo)

### 2. Vá em Environment Variables

1. No menu lateral, clique em **Settings**
2. Clique em **Environment Variables**

### 3. Adicione Cada Variável

Para **CADA** variável do seu arquivo `.env`:

1. Clique no botão **"Add New"** ou **"Add"**
2. No campo **Key**, cole o NOME da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
3. No campo **Value**, cole o VALOR da variável (o valor real do seu .env)
4. Marque os ambientes onde a variável será usada:
   - ☑️ **Production**
   - ☑️ **Preview** 
   - ☑️ **Development**
5. Clique em **"Save"**

### 4. Repita para Todas as Variáveis

Você precisa adicionar **TODAS** estas 13 variáveis:

#### Supabase (3)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### App URL (1)
- `NEXT_PUBLIC_APP_URL`

#### Stripe - Chaves (3)
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### Stripe - Price IDs (6)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY`
- `NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY`
- `NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY`
- `NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY`
- `NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_YEARLY`
- `NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY`

---

## 💡 Dica Rápida

1. Abra seu arquivo `.env` local
2. Vá no Vercel (Settings → Environment Variables)
3. Para cada linha do `.env`:
   - Copie a parte antes do `=` (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - Cole no campo **Key**
   - Copie a parte depois do `=` (ex: `https://your-project.supabase.co`)
   - Cole no campo **Value**
   - Marque os 3 ambientes
   - Clique **Save**

---

## ❓ Por que não posso importar o arquivo .env?

Por **segurança**, o Vercel não permite importar arquivos `.env` diretamente. Isso garante que:
- As variáveis sejam revisadas uma por uma
- Não haja vazamento acidental de secrets
- Você tenha controle total sobre quais variáveis são adicionadas

---

## ✅ Após Adicionar Todas as Variáveis

1. Certifique-se de que todas as 13 variáveis foram adicionadas
2. Faça um novo deploy (ou aguarde o próximo deploy automático)
3. Verifique os logs para garantir que não há erros relacionados a variáveis faltantes

---

**Tempo estimado:** ~5-10 minutos para adicionar todas as 13 variáveis
