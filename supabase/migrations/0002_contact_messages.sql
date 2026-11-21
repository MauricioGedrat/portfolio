-- Contact form messages. Same pattern as analytics: closed table,
-- validated insert function, password-checked read function.

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  name text not null check (length(name) between 1 and 80),
  email text not null check (length(email) between 5 and 120),
  body text not null check (length(body) between 10 and 2000),
  locale text,
  city text,
  visitor text not null,
  read boolean not null default false
);
create index if not exists contact_messages_at_idx on public.contact_messages (at desc);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;

alter table public.site_events drop constraint if exists site_events_name_check;
alter table public.site_events add constraint site_events_name_check check (name in (
  'page_view','project_view','resume_download','contact_click','contact_submit',
  'cta_click','external_link_click','locale_switch'));

create or replace function public.submit_message(
  p_name text, p_email text, p_body text, p_locale text, p_city text, p_visitor text
) returns text
language plpgsql security definer set search_path = '' as $$
begin
  if p_visitor is null or length(p_visitor) > 64 then return 'invalid'; end if;
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then return 'invalid'; end if;
  if length(coalesce(p_name, '')) not between 1 and 80
     or length(coalesce(p_body, '')) not between 10 and 2000 then
    return 'invalid';
  end if;
  if (select count(*) from public.contact_messages
      where visitor = p_visitor and at > now() - interval '1 day') >= 5 then
    return 'limited';
  end if;
  insert into public.contact_messages (name, email, body, locale, city, visitor)
  values (trim(p_name), trim(p_email), trim(p_body), left(p_locale, 5), left(p_city, 80), p_visitor);
  return 'ok';
end $$;

create or replace function public.get_messages(p_key text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  if not exists (select 1 from private.insights_secret s where s.hash = extensions.crypt(p_key, s.hash)) then
    perform pg_sleep(0.6);
    return null;
  end if;
  select coalesce(jsonb_agg(m order by m.at desc), '[]') into result from (
    select id, at, name, email, body, locale, city, read
    from public.contact_messages order by at desc limit 100) m;
  update public.contact_messages set read = true where read = false;
  return result;
end $$;

revoke all on function public.submit_message(text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.get_messages(text) from public, anon, authenticated;
grant execute on function public.submit_message(text,text,text,text,text,text) to anon;
grant execute on function public.get_messages(text) to anon;
