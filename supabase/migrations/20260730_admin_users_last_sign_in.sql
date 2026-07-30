-- Add last_sign_in_at to admin user listing (requires admin_profiles migration).

create or replace function public.admin_list_users()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
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
    u.last_sign_in_at,
    (select count(*) from public.cards c where c.user_id = u.id),
    (select count(*) from public.expenses e where e.user_id = u.id)
  from auth.users u
  order by u.created_at desc
  limit 200;
end;
$$;

revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;
