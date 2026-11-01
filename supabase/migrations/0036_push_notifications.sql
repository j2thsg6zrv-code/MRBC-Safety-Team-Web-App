-- Phone/computer push notifications for Team Chat.
--
-- Each device that turns on notifications saves a push subscription. When a
-- chat message is posted, the database asks the website (same secret as the
-- email sender) to push it to the other people's devices. The VAPID key pair
-- that signs the pushes is kept in notification_settings, which nobody can read.
-- The website makes the key pair the first time an admin turns notifications on.

alter table public.notification_settings
  add column if not exists vapid_public text,
  add column if not exists vapid_private text;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  device text,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_profile_idx on public.push_subscriptions (profile_id);

alter table public.push_subscriptions enable row level security;
drop policy if exists "own push subscriptions" on public.push_subscriptions;
create policy "own push subscriptions" on public.push_subscriptions
  for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Per-member choice: whole-team posts can be turned off, direct messages always push.
alter table public.profiles add column if not exists push_chat_team boolean not null default true;

-- The browser needs the public key to subscribe.
create or replace function public.push_public_key()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select vapid_public from public.notification_settings;
$$;
revoke all on function public.push_public_key() from public, anon;
grant execute on function public.push_public_key() to authenticated;

-- First-time setup: an admin's browser session saves the key pair the website
-- generated. Only fills in empty keys, so it can't replace them later.
create or replace function public.push_set_keys(p_public text, p_private text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can set up notifications.';
  end if;
  update public.notification_settings
     set vapid_public = p_public, vapid_private = p_private
   where vapid_public is null;
  return (select vapid_public from public.notification_settings);
end;
$$;
revoke all on function public.push_set_keys(text, text) from public, anon;
grant execute on function public.push_set_keys(text, text) to authenticated;

-- Everything the website needs to push one chat message.
create or replace function public.push_claim(p_secret text, p_message_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
  m public.chat_messages;
  sender_name text;
  preview text;
begin
  select * into s from public.notification_settings;
  if s.secret is distinct from p_secret then
    raise exception 'Not allowed';
  end if;
  select * into m from public.chat_messages where id = p_message_id;
  if not found then return null; end if;
  -- Only push fresh messages, so a replayed request can't re-send old ones.
  if m.created_at < now() - interval '10 minutes' then return null; end if;

  select coalesce(nullif(btrim(full_name), ''), email) into sender_name from public.profiles where id = m.sender_id;
  preview := left(regexp_replace(btrim(m.body), '\s+', ' ', 'g'), 180);
  if length(btrim(m.body)) > 180 then preview := preview || '...'; end if;

  return jsonb_build_object(
    'vapid_public', s.vapid_public,
    'vapid_private', s.vapid_private,
    'site_url', s.site_url,
    'title', case when m.recipient_id is null then sender_name || ' (whole team)' else sender_name end,
    'body', preview,
    'url', '/chat/' || case when m.recipient_id is null then 'team' else m.sender_id::text end,
    'tag', 'chat-' || case when m.recipient_id is null then 'team' else m.sender_id::text end,
    'subscriptions', coalesce((
      select jsonb_agg(jsonb_build_object('endpoint', ps.endpoint, 'p256dh', ps.p256dh, 'auth', ps.auth))
        from public.push_subscriptions ps
        join public.profiles p on p.id = ps.profile_id
       where p.active and p.id <> m.sender_id
         and case when m.recipient_id is null then p.push_chat_team else p.id = m.recipient_id end
    ), '[]'::jsonb)
  );
end;
$$;
revoke all on function public.push_claim(text, uuid) from public;
grant execute on function public.push_claim(text, uuid) to anon, authenticated;

-- Drops a device the push service says is gone (app removed, permission revoked).
create or replace function public.push_forget(p_secret text, p_endpoint text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.notification_settings where secret = p_secret) then
    raise exception 'Not allowed';
  end if;
  delete from public.push_subscriptions where endpoint = p_endpoint;
end;
$$;
revoke all on function public.push_forget(text, text) from public;
grant execute on function public.push_forget(text, text) to anon, authenticated;

-- On every new chat message, ask the website to push it (only if anyone has a device set up).
create or replace function public.push_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
begin
  if not exists (
    select 1 from public.push_subscriptions ps
     where ps.profile_id <> new.sender_id
       and (new.recipient_id is null or ps.profile_id = new.recipient_id)
  ) then
    return new;
  end if;
  select * into s from public.notification_settings;
  perform net.http_post(
    url := s.site_url || '/api/push/send',
    headers := jsonb_build_object('Authorization', 'Bearer ' || s.secret, 'Content-Type', 'application/json'),
    body := jsonb_build_object('message_id', new.id),
    timeout_milliseconds := 30000
  );
  return new;
exception when others then
  raise warning 'push_chat_message: %', sqlerrm;
  return new;
end;
$$;
revoke all on function public.push_chat_message() from public, anon, authenticated;

drop trigger if exists push_chat_message on public.chat_messages;
create trigger push_chat_message
  after insert on public.chat_messages
  for each row execute function public.push_chat_message();
