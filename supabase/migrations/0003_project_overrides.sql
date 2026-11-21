-- CMS: per-project text overrides edited in /studio. The site merges them
-- over the content in content/projects.ts; deleting a row restores the original.

create table if not exists public.project_overrides (
  slug text primary key check (length(slug) <= 80),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.project_overrides enable row level security;
revoke all on public.project_overrides from anon, authenticated;

-- Published content is public anyway; reading needs no password.
create or replace function public.get_overrides() returns jsonb
language sql security definer set search_path = '' stable as $$
  select coalesce(jsonb_object_agg(slug, data), '{}'::jsonb) from public.project_overrides
$$;

create or replace function public.check_key(p_key text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from private.insights_secret s where s.hash = extensions.crypt(p_key, s.hash)) then
    return true;
  end if;
  perform pg_sleep(0.6);
  return false;
end $$;

create or replace function public.save_override(p_key text, p_slug text, p_data jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if not public.check_key(p_key) then return false; end if;
  if jsonb_typeof(p_data) <> 'object' or length(p_data::text) > 40000 then return false; end if;
  insert into public.project_overrides (slug, data, updated_at) values (p_slug, p_data, now())
  on conflict (slug) do update set data = excluded.data, updated_at = now();
  return true;
end $$;

create or replace function public.delete_override(p_key text, p_slug text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if not public.check_key(p_key) then return false; end if;
  delete from public.project_overrides where slug = p_slug;
  return true;
end $$;

revoke all on function public.get_overrides() from public, anon, authenticated;
revoke all on function public.check_key(text) from public, anon, authenticated;
revoke all on function public.save_override(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.delete_override(text, text) from public, anon, authenticated;
grant execute on function public.get_overrides() to anon;
grant execute on function public.check_key(text) to anon;
grant execute on function public.save_override(text, text, jsonb) to anon;
grant execute on function public.delete_override(text, text) to anon;
