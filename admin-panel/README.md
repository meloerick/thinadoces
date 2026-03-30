# Painel Admin - Thina Doces

Painel administrativo privado, seguro e pronto para producao, construido com:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres + RLS

## Rotas

- `/admin/login`
- `/admin`
- `/admin/orders`
- `/admin/products`
- `/admin/settings`

## Funcionalidades entregues

- Login real com Supabase Auth (email/senha)
- Sessao persistente
- Logout funcional
- Protecao de rotas privadas via `middleware` + guards server-side
- Dashboard com resumo operacional
- Acao rapida para abrir/fechar loja e ativar/desativar pedidos
- Gestao de pedidos com filtro, busca e atualizacao de status
- Pedidos e configuracoes com sincronizacao em tempo real (Supabase Realtime)
- Gestao de produtos com CRUD, ativar/desativar e exclusao
- Gestao de configuracoes globais da loja
- Validacoes com Zod
- Tipagem forte em toda a base
- API routes administrativas seguras

## Estrutura do projeto

```txt
app/
  admin/
    login/page.tsx
    orders/page.tsx
    products/page.tsx
    settings/page.tsx
    page.tsx
  api/admin/
    orders/route.ts
    orders/[id]/status/route.ts
    products/route.ts
    products/[id]/route.ts
    products/[id]/toggle/route.ts
    settings/route.ts
  layout.tsx
  globals.css

components/
  admin/
  ui/

lib/
  supabase/
  auth/
  db/
  validations/
  utils/

types/

middleware.ts
.env.example
supabase/schema.sql
```

## 1) Como instalar

1. Clone o repositorio.
2. Entre na pasta do painel:

```bash
cd admin-panel
```

3. Instale as dependencias:

```bash
npm install
```

4. Copie o arquivo de ambiente:

```bash
cp .env.example .env.local
```

5. Preencha as variaveis:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 2) Como configurar Supabase

1. Crie um projeto no Supabase.
2. Abra `SQL Editor` e rode o arquivo `supabase/schema.sql`.
3. No `Authentication > Users`, crie o usuario admin com o email `thinadoces@gmail.com`.
4. Promova o usuario para admin executando no SQL Editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'thinadoces@gmail.com';
```

5. O painel permite acesso somente para `thinadoces@gmail.com` (trava no frontend, middleware, guards server e RLS helper).
6. O SQL ja inclui publicacao Realtime para `orders`, `order_items` e `store_settings` para atualizacao em tempo real no painel.

## 3) Rodar localmente

```bash
npm run dev
```

Abrir:

- `http://localhost:3000/admin/login`

## 4) Deploy na Vercel

1. Suba o projeto para GitHub.
2. Importe na Vercel.
3. Configure as variaveis de ambiente:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.
5. Em producao, confirme que o Supabase esta com as mesmas tabelas/policies.

## 5) Integracao com o site principal

O site principal (publico) deve ler os dados diretamente do Supabase com a `anon key`.

### Consultas necessarias para o site principal

1. Configuracoes globais:

```sql
select orders_enabled, store_open, warning_message
from public.store_settings
limit 1;
```

2. Produtos visiveis:

```sql
select id, name, description, price, image_url, category
from public.products
where active = true
order by created_at desc;
```

3. Criacao de pedido no checkout publico:

- inserir em `public.orders`
- inserir itens em `public.order_items` vinculando `order_id`

### Regras de negocio que o site principal deve respeitar

- Se `orders_enabled = false`: bloquear checkout.
- Se `store_open = false`: exibir loja fechada.
- Se `warning_message` tiver valor: exibir aviso na interface.
- Nunca mostrar produto com `active = false`.

## Validacoes

Schemas Zod implementados em `lib/validations/`:

- `login.ts`
- `settings.ts`
- `product.ts`
- `order.ts`

## Seguranca

- RLS habilitado em todas as tabelas criticas.
- Publico sem acesso de leitura a pedidos.
- Publico sem permissao de alterar produtos/configuracoes.
- Area admin protegida em:
- `middleware.ts`
- guards server-side de pagina
- checagem admin nas API routes
- `SUPABASE_SERVICE_ROLE_KEY` nunca usado no client.

## SQL entregue

Arquivo completo:

- `supabase/schema.sql`

Contem:

- criacao de tabelas
- indices
- trigger de `updated_at`
- seed inicial
- RLS
- policies

## Observacoes de producao

- O painel foi construindo para operar em cima do mesmo banco do site principal.
- Alteracoes no painel refletem imediatamente no banco e, consequentemente, no site principal.
- Se quiser rastrear historico de mudancas de status no futuro, a evolucao recomendada e criar tabela de auditoria de pedidos.
