-- Reseller (books lane) schema
-- Apply in Supabase SQL editor.

-- Core: one row per “lot” you’re considering / bought
create table if not exists public.lots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  status text not null default 'lead'
    check (status in ('lead','bought','sorted','listed','sold','shipped','done')),

  source text not null default 'facebook',
  source_url text,

  title text,
  asking_price_cents int,
  purchase_price_cents int,

  approx_total_books int,
  approx_sellable_books int,

  category_tags text[] not null default '{}'::text[],

  zip text not null default '75071',
  radius_miles int,

  est_net_per_book_cents int,
  target_profit_cents int,

  -- actuals
  listed_at timestamptz,
  sold_at timestamptz,
  sold_price_cents int,
  shipping_charged_cents int,
  shipping_paid_cents int,
  ebay_fees_cents int,
  supplies_cents int,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Timeline / journey events
create table if not exists public.lot_events (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  kind text not null,
  from_status text,
  to_status text,
  note text,

  created_at timestamptz not null default now()
);

-- Per-user settings
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,

  zip text not null default '75071',
  radius_miles int,

  profit_floor_cents int not null default 1000,
  profit_percent_of_buy numeric not null default 0.25,

  net_per_book_presets jsonb not null default '{"kids":300,"mixed":400,"manga":600,"textbooks":800}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_lots_updated_at on public.lots;
create trigger trg_lots_updated_at
before update on public.lots
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

-- RLS
alter table public.lots enable row level security;
alter table public.lot_events enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "lots: own rows only" on public.lots;
create policy "lots: own rows only"
on public.lots
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "lot_events: own rows only" on public.lot_events;
create policy "lot_events: own rows only"
on public.lot_events
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- user_settings

drop policy if exists "user_settings: own row only" on public.user_settings;
create policy "user_settings: own row only"
on public.user_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
