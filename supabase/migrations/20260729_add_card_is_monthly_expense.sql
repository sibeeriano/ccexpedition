alter table public.cards
  add column if not exists is_monthly_expense boolean not null default false;
