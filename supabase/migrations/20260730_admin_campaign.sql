-- Admin email campaigns (broadcast to registered users).

create table if not exists public.admin_campaign_settings (
  id text primary key default 'default',
  config_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.admin_campaign_settings enable row level security;

create table if not exists public.admin_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  recipient_count int not null default 0,
  sent_count int not null default 0,
  failed_count int not null default 0,
  status text not null default 'sending',
  error_summary text,
  config_json jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.admin_campaigns enable row level security;

create index if not exists admin_campaigns_created_at_idx
  on public.admin_campaigns (created_at desc);

create or replace function public.admin_count_campaign_recipients()
returns int
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin_user() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return (
    select count(*)::int
    from auth.users u
    where u.email is not null
      and u.email_confirmed_at is not null
      and lower(u.email) <> lower('admin@ccexpedition.app')
  );
end;
$$;

revoke all on function public.admin_count_campaign_recipients() from public;
grant execute on function public.admin_count_campaign_recipients() to authenticated;

create or replace function public.admin_get_campaign_draft()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  draft jsonb;
begin
  if not public.is_admin_user() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select config_json into draft
  from public.admin_campaign_settings
  where id = 'default';

  return coalesce(draft, '{}'::jsonb);
end;
$$;

revoke all on function public.admin_get_campaign_draft() from public;
grant execute on function public.admin_get_campaign_draft() to authenticated;

create or replace function public.admin_save_campaign_draft(p_config jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_user() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  insert into public.admin_campaign_settings (id, config_json, updated_at)
  values ('default', coalesce(p_config, '{}'::jsonb), now())
  on conflict (id) do update
    set config_json = excluded.config_json,
        updated_at = now();
end;
$$;

revoke all on function public.admin_save_campaign_draft(jsonb) from public;
grant execute on function public.admin_save_campaign_draft(jsonb) to authenticated;

create or replace function public.admin_list_campaigns()
returns table (
  id uuid,
  subject text,
  recipient_count int,
  sent_count int,
  failed_count int,
  status text,
  created_at timestamptz,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_user() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  select
    c.id,
    c.subject,
    c.recipient_count,
    c.sent_count,
    c.failed_count,
    c.status,
    c.created_at,
    c.completed_at
  from public.admin_campaigns c
  order by c.created_at desc
  limit 20;
end;
$$;

revoke all on function public.admin_list_campaigns() from public;
grant execute on function public.admin_list_campaigns() to authenticated;

create or replace function public.admin_campaign_send_quota()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  daily_limit constant int := 100;
  sent_today int;
  recipients int;
begin
  if not public.is_admin_user() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select coalesce(sum(sent_count), 0)::int into sent_today
  from public.admin_campaigns
  where created_at >= date_trunc('day', now() at time zone 'utc');

  recipients := public.admin_count_campaign_recipients();

  return jsonb_build_object(
    'daily_limit', daily_limit,
    'sent_today', sent_today,
    'remaining_today', greatest(0, daily_limit - sent_today),
    'recipient_count', recipients
  );
end;
$$;

revoke all on function public.admin_campaign_send_quota() from public;
grant execute on function public.admin_campaign_send_quota() to authenticated;
