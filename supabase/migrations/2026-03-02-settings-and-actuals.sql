-- Patch for existing projects that already ran supabase/schema.sql earlier.

-- 1) Add actuals columns to lots (idempotent)
alter table public.lots add column if not exists listed_at timestamptz;
alter table public.lots add column if not exists sold_at timestamptz;
alter table public.lots add column if not exists sold_price_cents int;
alter table public.lots add column if not exists shipping_charged_cents int;
alter table public.lots add column if not exists shipping_paid_cents int;
alter table public.lots add column if not exists ebay_fees_cents int;
alter table public.lots add column if not exists supplies_cents int;

-- 2) user_settings table + RLS
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

alter table public.user_settings enable row level security;

drop policy if exists "user_settings: own row only" on public.user_settings;
create policy "user_settings: own row only"
on public.user_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- updated_at trigger (requires public.set_updated_at from original schema)
drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();
