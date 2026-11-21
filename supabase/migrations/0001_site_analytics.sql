-- Private analytics for the portfolio.
-- The table is closed (RLS on, no policies). The site writes and reads only
-- through two SECURITY DEFINER functions: track_event (validated insert) and
-- get_insights (password-checked aggregate read).

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.insights_secret (
  id boolean primary key default true check (id),
  hash text not null
);

create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  name text not null check (name in (
    'page_view','project_view','resume_download','contact_click',
    'cta_click','external_link_click','locale_switch')),
  path text,
  target text,
  locale text,
  referrer text,
  country text,
  region text,
  city text,
  device text,
  browser text,
  visitor text not null
);
create index if not exists site_events_at_idx on public.site_events (at desc);
create index if not exists site_events_visitor_at_idx on public.site_events (visitor, at desc);
alter table public.site_events enable row level security;
revoke all on public.site_events from anon, authenticated;

create or replace function public.track_event(
  p_name text, p_path text, p_target text, p_locale text, p_referrer text,
  p_country text, p_region text, p_city text, p_device text, p_browser text, p_visitor text
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_visitor is null or length(p_visitor) > 64 then return; end if;
  -- Flood guard: at most 300 events per visitor per day.
  if (select count(*) from public.site_events
      where visitor = p_visitor and at > now() - interval '1 day') >= 300 then
    return;
  end if;
  insert into public.site_events (name, path, target, locale, referrer, country, region, city, device, browser, visitor)
  values (p_name, left(p_path, 200), left(p_target, 200), left(p_locale, 5), left(p_referrer, 200),
          left(p_country, 8), left(p_region, 16), left(p_city, 80), left(p_device, 16), left(p_browser, 16), p_visitor);
end $$;

create or replace function public.get_insights(p_key text, p_days int default 30)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  since timestamptz := (date_trunc('day', now() at time zone 'America/Sao_Paulo')
                        - make_interval(days => greatest(1, least(p_days, 365)) - 1)) at time zone 'America/Sao_Paulo';
  result jsonb;
begin
  if not exists (select 1 from private.insights_secret s
                 where s.hash = extensions.crypt(p_key, s.hash)) then
    perform pg_sleep(0.6); -- slows down guessing
    return null;
  end if;

  with e as (select * from public.site_events where at >= since),
  days as (
    select generate_series(
      (since at time zone 'America/Sao_Paulo')::date,
      (now() at time zone 'America/Sao_Paulo')::date, interval '1 day')::date as day
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'visitors',         (select count(distinct visitor) from e),
      'page_views',       (select count(*) from e where name = 'page_view'),
      'resume_downloads', (select count(*) from e where name = 'resume_download'),
      'project_views',    (select count(*) from e where name = 'project_view'),
      'contact_clicks',   (select count(*) from e where name = 'contact_click'),
      'external_clicks',  (select count(*) from e where name = 'external_link_click')),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'visitors', coalesce(x.v, 0), 'views', coalesce(x.p, 0)) order by d.day), '[]')
              from days d left join (
                select (at at time zone 'America/Sao_Paulo')::date as day,
                       count(distinct visitor) as v, count(*) filter (where name = 'page_view') as p
                from e group by 1) x on x.day = d.day),
    'cities', (select coalesce(jsonb_agg(r order by r.visitors desc), '[]') from (
                select city, region, country, count(distinct visitor) as visitors
                from e group by 1, 2, 3 order by 4 desc limit 10) r),
    'referrers', (select coalesce(jsonb_agg(r order by r.visitors desc), '[]') from (
                select coalesce(referrer, '') as host, count(distinct visitor) as visitors
                from e where name = 'page_view' group by 1 order by 2 desc limit 10) r),
    'projects', (select coalesce(jsonb_agg(r order by r.views desc), '[]') from (
                select target as slug, count(*) as views
                from e where name = 'project_view' and target is not null group by 1 order by 2 desc limit 10) r),
    'devices', (select coalesce(jsonb_agg(r order by r.visitors desc), '[]') from (
                select coalesce(device, '?') as device, count(distinct visitor) as visitors
                from e group by 1 order by 2 desc) r),
    'downloads', (select coalesce(jsonb_agg(r order by r.at desc), '[]') from (
                select at, name, path, target, locale, referrer, country, region, city, device, browser, visitor
                from e where name = 'resume_download' order by at desc limit 50) r),
    'recent', (select coalesce(jsonb_agg(r order by r.at desc), '[]') from (
                select at, name, path, target, locale, referrer, country, region, city, device, browser, visitor
                from e order by at desc limit 100) r)
  ) into result;
  return result;
end $$;

create or replace function public.keepalive() returns int
language sql security invoker set search_path = '' as $$ select 1 $$;

revoke all on function public.track_event(text,text,text,text,text,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.get_insights(text,int) from public, anon, authenticated;
revoke all on function public.keepalive() from public, anon, authenticated;
grant execute on function public.track_event(text,text,text,text,text,text,text,text,text,text,text) to anon;
grant execute on function public.get_insights(text,int) to anon;
grant execute on function public.keepalive() to anon;
