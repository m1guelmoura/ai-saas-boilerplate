# Autenticação com Supabase

Este documento descreve a implementação de autenticação usando Supabase no boilerplate.

## Estrutura de Arquivos

### Utilitários Supabase

- `lib/supabase/server.ts` - Cliente para Server Components, Server Actions e Route Handlers
- `lib/supabase/client.ts` - Cliente para Client Components
- `lib/supabase/middleware.ts` - Cliente para Middleware (refresh de sessão)

### Middleware

- `middleware.ts` - Protege rotas e faz refresh automático de sessões

### Rotas de Autenticação

- `app/login/page.tsx` - Página de login
- `app/signup/page.tsx` - Página de registro
- `app/dashboard/page.tsx` - Página protegida (requer autenticação)
- `app/auth/callback/route.ts` - Callback para confirmação de email e OAuth
- `app/auth/actions.ts` - Server Actions para login, signup e logout

### Componentes

- `components/auth/login-form.tsx` - Formulário de login
- `components/auth/signup-form.tsx` - Formulário de registro

## Fluxo de Autenticação

### 1. Login

1. Usuário acessa `/login`
2. Preenche email e senha
3. Server Action `signIn` valida credenciais
4. Se válido, redireciona para `/dashboard`
5. Se inválido, exibe erro

### 2. Signup

1. Usuário acessa `/signup`
2. Preenche email, senha e confirmação
3. Server Action `signUp` cria conta
4. Supabase envia email de confirmação
5. Usuário clica no link do email
6. Callback route confirma a conta
7. Usuário é redirecionado para `/dashboard`

### 3. Proteção de Rotas

- Middleware verifica autenticação em cada request
- Rotas protegidas (ex: `/dashboard`) redirecionam para `/login` se não autenticado
- Usuários autenticados são redirecionados de `/login` e `/signup` para `/dashboard`

### 4. Logout

1. Usuário clica em "Sair" no dashboard
2. Server Action `signOut` limpa a sessão
3. Redireciona para `/login`

## Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Próximos Passos

- [ ] Implementar OAuth (Google, GitHub, etc.)
- [ ] Adicionar recuperação de senha
- [ ] Implementar verificação de email
- [ ] Adicionar 2FA (opcional)
