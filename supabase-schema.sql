create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  category text not null,
  price integer not null check (price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  order_number text not null,
  customer_name text not null,
  service_mode text not null,
  customer_phone text not null default '',
  order_notes text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0 check (subtotal >= 0),
  service_fee integer not null default 0 check (service_fee >= 0),
  total integer not null default 0 check (total >= 0),
  status text not null default 'new' check (status in ('new', 'preparing', 'ready', 'issue', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_accounts (
  username text primary key,
  display_name text not null,
  requires_password boolean not null default true,
  password_hash text,
  points integer not null default 0 check (points >= 0),
  order_count integer not null default 0 check (order_count >= 0),
  bonus_carry numeric not null default 0,
  milestones_reached jsonb not null default '[]'::jsonb,
  last_updated timestamptz not null default now()
);

alter table public.loyalty_accounts add column if not exists requires_password boolean not null default true;
alter table public.loyalty_accounts add column if not exists password_hash text;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

insert into public.menu_items (id, name, category, price)
values
  ('flat-white', 'Flat White', 'Espresso Hot', 105),
  ('americano-hot', 'Americano', 'Espresso Hot', 85),
  ('cappuccino', 'Cappuccino', 'Espresso Hot', 105),
  ('cafe-latte-hot', 'Cafe Latte', 'Espresso Hot', 105),
  ('dirty-spaniard-hot', 'Dirty Spaniard', 'Espresso Hot', 165),
  ('creamy-vanilla-hot', 'Creamy Vanilla', 'Espresso Hot', 155),
  ('mocha-ripple-hot', 'Mocha Ripple', 'Espresso Hot', 155),
  ('caramel-cognac-hot', 'Caramel Cognac', 'Espresso Hot', 155),
  ('americano-cold', 'Americano', 'Espresso Cold', 100),
  ('cafe-latte-cold', 'Cafe Latte', 'Espresso Cold', 115),
  ('creamy-vanilla-cold', 'Creamy Vanilla', 'Espresso Cold', 165),
  ('mocha-ripple-cold', 'Mocha Ripple', 'Espresso Cold', 165),
  ('caramel-cognac-cold', 'Caramel Cognac', 'Espresso Cold', 165),
  ('pink-foam', 'Pink Foam', 'Espresso Cold', 175),
  ('dirty-spaniard-cold', 'Dirty Spaniard', 'Espresso Cold', 175),
  ('choco-loco', 'Choco Loco', 'Milk', 165),
  ('strawberry-dream', 'Strawberry Dream', 'Milk', 165),
  ('strawberry-fizz', 'Strawberry Fizz', 'Fizz', 165),
  ('passion-fruit-fizz', 'Passion Fruit Fizz', 'Fizz', 165),
  ('lemon-fizz', 'Lemon Fizz', 'Fizz', 155),
  ('blueberry-fizz', 'Blueberry Fizz', 'Fizz', 165),
  ('peach-fizz', 'Peach Fizz', 'Fizz', 165),
  ('peach-mango-fizz', 'Peach Mango Fizz', 'Fizz', 165),
  ('strawberry-tea', 'Strawberry Tea', 'Black Tea', 165),
  ('lemon-mint-tea', 'Lemon Mint Tea', 'Black Tea', 165),
  ('lemon-tea', 'Lemon Tea', 'Black Tea', 155),
  ('blueberry-tea', 'Blueberry Tea', 'Black Tea', 165),
  ('peach-tea', 'Peach Tea', 'Black Tea', 165),
  ('matcha-blush', 'Matcha Blush', 'Matcha', 170),
  ('sea-salt-matcha', 'Sea Salt Matcha', 'Matcha', 160),
  ('soft-matcha', 'Soft Matcha', 'Matcha', 150)
on conflict (id) do update
set
  name = excluded.name,
  category = excluded.category,
  price = excluded.price;

alter table public.menu_items enable row level security;
alter table public.app_settings enable row level security;
alter table public.orders enable row level security;
alter table public.loyalty_accounts enable row level security;

drop policy if exists "public can read menu items" on public.menu_items;
create policy "public can read menu items"
on public.menu_items for select
using (true);

drop policy if exists "public can read app settings" on public.app_settings;
create policy "public can read app settings"
on public.app_settings for select
using (true);

drop policy if exists "public can read orders" on public.orders;
create policy "public can read orders"
on public.orders for select
using (true);

drop policy if exists "public can read loyalty accounts" on public.loyalty_accounts;
create policy "public can read loyalty accounts"
on public.loyalty_accounts for select
using (true);

drop policy if exists "public can write menu items" on public.menu_items;
create policy "public can write menu items"
on public.menu_items for all
using (true)
with check (true);

drop policy if exists "public can write app settings" on public.app_settings;
create policy "public can write app settings"
on public.app_settings for all
using (true)
with check (true);

drop policy if exists "public can write orders" on public.orders;
create policy "public can write orders"
on public.orders for all
using (true)
with check (true);

drop policy if exists "public can write loyalty accounts" on public.loyalty_accounts;
create policy "public can write loyalty accounts"
on public.loyalty_accounts for all
using (true)
with check (true);

insert into public.loyalty_accounts (username, display_name, requires_password, password_hash, points, order_count, bonus_carry, milestones_reached, last_updated)
values
  ('EchanoEdgin', 'EchanoEdgin', false, null, 80, 55, 0, '[5,10,15,20]'::jsonb, now()),
  ('EchanoCharles', 'EchanoCharles', false, null, 80, 55, 0, '[5,10,15,20]'::jsonb, now())
on conflict (username) do update
set
  display_name = excluded.display_name,
  requires_password = excluded.requires_password,
  password_hash = excluded.password_hash,
  points = excluded.points,
  order_count = excluded.order_count,
  bonus_carry = excluded.bonus_carry,
  milestones_reached = excluded.milestones_reached,
  last_updated = excluded.last_updated;
