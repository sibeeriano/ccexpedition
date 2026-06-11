-- Adelantos de pago y saldos a favor que restan del total mensual de cada tarjeta.
create table if not exists public.balance_adjustments (
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

create index if not exists balance_adjustments_card_id_idx
  on public.balance_adjustments (card_id);
create index if not exists balance_adjustments_user_id_idx
  on public.balance_adjustments (user_id);

alter table public.balance_adjustments enable row level security;

create policy "Users manage own balance adjustments"
  on public.balance_adjustments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
