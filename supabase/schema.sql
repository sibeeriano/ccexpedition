-- Card Tracker schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query).

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  holder text not null,
  color text not null,
  background_color text,
  created_at timestamptz not null default now()
);

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  description text not null,
  total_amount numeric not null default 0 check (total_amount >= 0),
  total_amount_usd numeric not null default 0 check (total_amount_usd >= 0),
  installments integer not null default 1 check (installments between 1 and 48),
  start_month text not null check (start_month ~ '^\d{4}-\d{2}$'),
  is_monthly_charge boolean not null default false,
  category_id uuid references public.expense_categories (id) on delete set null,
  constraint expenses_has_amount check (total_amount > 0 or total_amount_usd > 0),
  created_at timestamptz not null default now()
);

create index expense_categories_user_id_idx on public.expense_categories (user_id);
create index expenses_category_id_idx on public.expenses (category_id);

create table public.balance_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  description text not null,
  amount numeric not null default 0 check (amount >= 0),
  amount_usd numeric not null default 0 check (amount_usd >= 0),
  type text not null check (type in ('payment_advance', 'credit_balance')),
  apply_month text not null check (apply_month ~ '^\d{4}-\d{2}$'),
  constraint balance_adjustments_has_amount check (amount > 0 or amount_usd > 0),
  created_at timestamptz not null default now()
);

create index expenses_card_id_idx on public.expenses (card_id);
create index balance_adjustments_card_id_idx on public.balance_adjustments (card_id);
create index cards_user_id_idx on public.cards (user_id);
create index expenses_user_id_idx on public.expenses (user_id);
create index balance_adjustments_user_id_idx on public.balance_adjustments (user_id);

create table public.monthly_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  paid_in_full boolean not null default true,
  amount_paid numeric not null default 0 check (amount_paid >= 0),
  amount_paid_usd numeric not null default 0 check (amount_paid_usd >= 0),
  created_at timestamptz not null default now(),
  unique (card_id, month)
);

create table public.pending_carryovers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  apply_month text not null check (apply_month ~ '^\d{4}-\d{2}$'),
  source_month text not null check (source_month ~ '^\d{4}-\d{2}$'),
  amount numeric not null default 0 check (amount >= 0),
  amount_usd numeric not null default 0 check (amount_usd >= 0),
  payment_id uuid not null references public.monthly_payments (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint pending_carryovers_has_amount check (amount > 0 or amount_usd > 0),
  unique (card_id, apply_month)
);

create index monthly_payments_card_id_idx on public.monthly_payments (card_id);
create index monthly_payments_user_id_idx on public.monthly_payments (user_id);
create index pending_carryovers_card_id_idx on public.pending_carryovers (card_id);
create index pending_carryovers_user_id_idx on public.pending_carryovers (user_id);

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: each user only sees and manages their own data.
alter table public.expense_categories enable row level security;
alter table public.cards enable row level security;
alter table public.expenses enable row level security;
alter table public.balance_adjustments enable row level security;
alter table public.monthly_payments enable row level security;
alter table public.pending_carryovers enable row level security;
alter table public.user_settings enable row level security;

create policy "Users manage own expense categories"
  on public.expense_categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own cards"
  on public.cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own expenses"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own balance adjustments"
  on public.balance_adjustments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own monthly payments"
  on public.monthly_payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own pending carryovers"
  on public.pending_carryovers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own settings"
  on public.user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
