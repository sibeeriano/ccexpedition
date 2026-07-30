-- Run once in Supabase SQL Editor (production: yenhoyjlynkpazyllbpd)
-- https://supabase.com/dashboard/project/yenhoyjlynkpazyllbpd/sql/new

-- 1) Admin profiles + RPCs (same as migrations/20260730_add_admin_profiles.sql)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where user_id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, is_admin)
  values (
    new.id,
    lower(new.email) = lower('admin@ccexpedition.app')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

insert into public.profiles (user_id, is_admin)
select id, lower(email) = lower('admin@ccexpedition.app')
from auth.users
on conflict (user_id) do update
  set is_admin = excluded.is_admin;

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  since timestamptz := now() - interval '7 days';
begin
  if not public.is_admin_user() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_users', (select count(*)::int from auth.users),
    'new_users_7d', (
      select count(*)::int from auth.users where created_at >= since
    ),
    'total_cards', (select count(*)::int from public.cards),
    'total_expenses', (select count(*)::int from public.expenses)
  );
end;
$$;

revoke all on function public.admin_dashboard_stats() from public;
grant execute on function public.admin_dashboard_stats() to authenticated;

create or replace function public.admin_list_users()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  cards_count bigint,
  expenses_count bigint
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin_user() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  select
    u.id,
    u.email::text,
    u.created_at,
    (select count(*) from public.cards c where c.user_id = u.id),
    (select count(*) from public.expenses e where e.user_id = u.id)
  from auth.users u
  order by u.created_at desc
  limit 200;
end;
$$;

revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;

-- 2) Confirm admin email so login works
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(email) = lower('admin@ccexpedition.app');

-- 3) Ensure admin flag
insert into public.profiles (user_id, is_admin)
select id, true
from auth.users
where lower(email) = lower('admin@ccexpedition.app')
on conflict (user_id) do update set is_admin = true;
