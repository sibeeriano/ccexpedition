alter table public.expenses
  add column if not exists is_monthly_charge boolean not null default false;
