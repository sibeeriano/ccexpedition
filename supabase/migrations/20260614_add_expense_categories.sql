-- Custom expense categories (run in Supabase SQL Editor; do not affect existing rows).
-- Existing expenses keep category_id = NULL until the user assigns one.

create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.expenses
  add column category_id uuid references public.expense_categories (id) on delete set null;

create index expense_categories_user_id_idx on public.expense_categories (user_id);
create index expenses_category_id_idx on public.expenses (category_id);

alter table public.expense_categories enable row level security;

create policy "Users manage own expense categories"
  on public.expense_categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
