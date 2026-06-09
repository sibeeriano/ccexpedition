-- Run in Supabase SQL Editor if the project already exists.

alter table public.expenses
  add column if not exists total_amount_usd numeric not null default 0
  check (total_amount_usd >= 0);

alter table public.expenses drop constraint if exists expenses_total_amount_check;

alter table public.expenses
  alter column total_amount set default 0;

alter table public.expenses drop constraint if exists expenses_has_amount;

alter table public.expenses
  add constraint expenses_has_amount
  check (total_amount > 0 or total_amount_usd > 0);
