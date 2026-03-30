-- =====================================================
-- Admin Panel + Site Principal - Supabase SQL Completo
-- =====================================================
-- Execute este arquivo no SQL Editor do Supabase.

create extension if not exists pgcrypto;

-- =====================================================
-- Tabelas
-- =====================================================
create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  orders_enabled boolean not null default true,
  store_open boolean not null default true,
  warning_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garante que exista apenas 1 registro global
create unique index if not exists store_settings_singleton_idx
  on public.store_settings ((true));

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products(active);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  note text,
  payment_method text not null,
  status text not null default 'pendente'
    check (status in ('pendente', 'confirmado', 'em preparo', 'saiu para entrega', 'concluido', 'cancelado')),
  total_price numeric(10,2) not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_customer_name_idx on public.orders(customer_name);
create index if not exists orders_customer_phone_idx on public.orders(customer_phone);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

-- =====================================================
-- Realtime (pedidos/configuracoes ao vivo no painel)
-- =====================================================
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    execute 'alter publication supabase_realtime add table public.orders';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'order_items'
  ) then
    execute 'alter publication supabase_realtime add table public.order_items';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'store_settings'
  ) then
    execute 'alter publication supabase_realtime add table public.store_settings';
  end if;
end
$$;

-- =====================================================
-- Trigger para updated_at
-- =====================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_store_settings_updated_at on public.store_settings;
create trigger trg_store_settings_updated_at
before update on public.store_settings
for each row
execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

-- =====================================================
-- Seed inicial
-- =====================================================
insert into public.store_settings (orders_enabled, store_open, warning_message)
select true, true, null
where not exists (select 1 from public.store_settings);

insert into public.products (name, description, price, image_url, category, active)
values
  ('Bolo de Ninho com Morango', 'Bolo artesanal com recheio de ninho e morango fresco.', 89.90, null, 'Bolos', true),
  ('Browkies com Nutella', 'Brownie com cookies recheado com nutella.', 19.99, null, 'Doces', true),
  ('Copo da Felicidade', 'Camadas de creme, chocolate e cobertura especial.', 14.99, null, 'Doces', true)
on conflict do nothing;

-- =====================================================
-- Funcao helper de admin (apenas a conta autorizada)
-- =====================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select
    auth.role() = 'service_role'
    or (
      coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
      and lower(coalesce(auth.jwt() ->> 'email', '')) = 'thinadoces@gmail.com'
    );
$$;

-- =====================================================
-- RLS
-- =====================================================
alter table public.store_settings enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- =====================================================
-- Policies: store_settings
-- Publico: leitura para o site principal
-- Admin: leitura/edicao
-- =====================================================
drop policy if exists "Public can read store settings" on public.store_settings;
create policy "Public can read store settings"
on public.store_settings
for select
using (true);

drop policy if exists "Admin can update store settings" on public.store_settings;
create policy "Admin can update store settings"
on public.store_settings
for update
using (public.is_admin())
with check (public.is_admin());

-- =====================================================
-- Policies: products
-- Publico: ler apenas ativos
-- Admin: CRUD completo
-- =====================================================
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
using (active = true or public.is_admin());

drop policy if exists "Admin can insert products" on public.products;
create policy "Admin can insert products"
on public.products
for insert
with check (public.is_admin());

drop policy if exists "Admin can update products" on public.products;
create policy "Admin can update products"
on public.products
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can delete products"
on public.products
for delete
using (public.is_admin());

-- =====================================================
-- Policies: orders
-- Publico: pode criar pedido
-- Admin: ler e atualizar pedido
-- =====================================================
drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
on public.orders
for insert
with check (true);

drop policy if exists "Admin can read orders" on public.orders;
create policy "Admin can read orders"
on public.orders
for select
using (public.is_admin());

drop policy if exists "Admin can update orders" on public.orders;
create policy "Admin can update orders"
on public.orders
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin can delete orders" on public.orders;
create policy "Admin can delete orders"
on public.orders
for delete
using (public.is_admin());

-- =====================================================
-- Policies: order_items
-- Publico: pode criar itens se order_id existir
-- Admin: leitura/edicao/exclusao
-- =====================================================
drop policy if exists "Public can create order items" on public.order_items;
create policy "Public can create order items"
on public.order_items
for insert
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
  )
);

drop policy if exists "Admin can read order items" on public.order_items;
create policy "Admin can read order items"
on public.order_items
for select
using (public.is_admin());

drop policy if exists "Admin can update order items" on public.order_items;
create policy "Admin can update order items"
on public.order_items
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin can delete order items" on public.order_items;
create policy "Admin can delete order items"
on public.order_items
for delete
using (public.is_admin());

-- =====================================================
-- Comando util para promover um usuario para admin
-- Execute apos criar o usuario no Auth.
-- =====================================================
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'thinadoces@gmail.com';
