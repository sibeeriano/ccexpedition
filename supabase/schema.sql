-- Card Tracker schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query).

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  holder text not null,
  color text not null,
  created_at timestamptz not null default now()
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
  constraint expenses_has_amount check (total_amount > 0 or total_amount_usd > 0),
  created_at timestamptz not null default now()
);

create index expenses_card_id_idx on public.expenses (card_id);
create index cards_user_id_idx on public.cards (user_id);
create index expenses_user_id_idx on public.expenses (user_id);

-- Row Level Security: each user only sees and manages their own data.
alter table public.cards enable row level security;
alter table public.expenses enable row level security;

create policy "Users manage own cards"
  on public.cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own expenses"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
