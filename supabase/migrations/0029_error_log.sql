-- Bug console (Matt, 2026-10-30): whenever something goes wrong in the app,
-- save a log entry with a short error code, the page, who was signed in, when,
-- and the technical details needed to fix it. Only admins can read it, on the
-- Admin tab.
--
-- Entries are only written through log_error(), which anyone can call (errors
-- also happen on the sign-in and public greeter pages). It trims every field,
-- folds repeats of the same error into one entry with a count, and drops
-- entries not seen for 180 days.

create table public.error_log (
  id bigint generated always as identity primary key,
  code text not null unique,
  source text not null check (source in ('browser', 'server', 'form', 'test')),
  message text not null,
  details text,
  -- Next.js gives a server crash the same digest on the server and in the
  -- browser, so the two reports of one crash become one entry.
  digest text,
  page text,
  user_id uuid references public.profiles(id) on delete set null,
  user_agent text,
  occurrences integer not null default 1,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  fixed_at timestamptz
);

create index error_log_last_seen_idx on public.error_log (last_seen_at desc);
create index error_log_digest_idx on public.error_log (digest) where digest is not null;

alter table public.error_log enable row level security;

create policy "Admins read the error log" on public.error_log
  for select using (public.is_admin());
create policy "Admins update the error log" on public.error_log
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete from the error log" on public.error_log
  for delete using (public.is_admin());

create or replace function public.log_error(
  p_source text,
  p_message text,
  p_details text default null,
  p_page text default null,
  p_digest text default null,
  p_user_agent text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source text := case when p_source in ('browser', 'server', 'form', 'test') then p_source else 'browser' end;
  v_message text := left(coalesce(nullif(trim(p_message), ''), 'Unknown error'), 1000);
  v_details text := left(p_details, 8000);
  v_page text := left(p_page, 500);
  v_digest text := left(nullif(trim(p_digest), ''), 100);
  v_agent text := left(p_user_agent, 300);
  v_user uuid := auth.uid();
  v_row public.error_log;
  v_code text;
begin
  -- Only signed-in people are linked to an entry (and only if they have a profile).
  if v_user is not null and not exists (select 1 from public.profiles where id = v_user) then
    v_user := null;
  end if;

  delete from public.error_log where last_seen_at < now() - interval '180 days';

  -- The other half of a crash already reported (server details + browser page/user).
  if v_digest is not null then
    select * into v_row from public.error_log
     where digest = v_digest and last_seen_at > now() - interval '1 day'
     order by last_seen_at desc limit 1;
    if found then
      update public.error_log set
        user_id = coalesce(user_id, v_user),
        page = coalesce(page, v_page),
        user_agent = coalesce(user_agent, v_agent),
        -- Keep the server's real message; the browser only sees a generic one.
        message = case when source = 'browser' and v_source = 'server' then v_message else message end,
        details = case
          when source = v_source then details
          when v_source = 'server' then concat_ws(E'\n\n', v_details, details)
          else concat_ws(E'\n\n', details, v_details)
        end,
        source = case when v_source = 'server' then 'server' else source end,
        occurrences = occurrences + case when source = v_source then 1 else 0 end,
        last_seen_at = now()
      where id = v_row.id;
      return v_row.code;
    end if;
  end if;

  -- The same error on the same page again: count it instead of adding a new entry.
  select * into v_row from public.error_log
   where fixed_at is null and source = v_source and message = v_message
     and page is not distinct from v_page
   order by last_seen_at desc limit 1;
  if found then
    update public.error_log set
      occurrences = occurrences + 1,
      last_seen_at = now(),
      user_id = coalesce(v_user, user_id),
      user_agent = coalesce(v_agent, user_agent),
      details = coalesce(v_details, details),
      digest = coalesce(v_digest, digest)
    where id = v_row.id;
    return v_row.code;
  end if;

  -- Don't let a runaway loop (or someone outside the team) fill the database.
  if (select count(*) from public.error_log) >= 5000 then
    return null;
  end if;

  loop
    -- Six characters without look-alikes (no 0/O, 1/I/L), e.g. E-7KQ3XM.
    select 'E-' || string_agg(substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', (floor(random() * 31) + 1)::int, 1), '')
      into v_code from generate_series(1, 6);
    exit when not exists (select 1 from public.error_log where code = v_code);
  end loop;

  insert into public.error_log (code, source, message, details, digest, page, user_id, user_agent)
  values (v_code, v_source, v_message, v_details, v_digest, v_page, v_user, v_agent);
  return v_code;
end;
$$;

revoke all on function public.log_error(text, text, text, text, text, text) from public;
grant execute on function public.log_error(text, text, text, text, text, text) to anon, authenticated;
