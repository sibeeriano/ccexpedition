-- Pagos mensuales por tarjeta y saldos pendientes automáticos al mes siguiente.
create table if not exists public.monthly_payments (
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

create table if not exists public.pending_carryovers (
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

create index if not exists monthly_payments_card_id_idx on public.monthly_payments (card_id);
create index if not exists monthly_payments_user_id_idx on public.monthly_payments (user_id);
create index if not exists pending_carryovers_card_id_idx on public.pending_carryovers (card_id);
create index if not exists pending_carryovers_user_id_idx on public.pending_carryovers (user_id);

alter table public.monthly_payments enable row level security;
alter table public.pending_carryovers enable row level security;

create policy "Users manage own monthly payments"
  on public.monthly_payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own pending carryovers"
  on public.pending_carryovers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
