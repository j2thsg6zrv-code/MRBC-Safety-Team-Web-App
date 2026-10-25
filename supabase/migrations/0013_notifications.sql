-- Automatic messages: thank-yous when someone signs up, reminders 48 and 24
-- hours before an event that still has open spots, and the Saturday-noon
-- reminder to Sunday's greeters.
--
-- The database decides what to send and queues it in notification_outbox.
-- Every 10 minutes pg_cron runs notify_tick(), which queues reminders that
-- are due. Whenever messages are queued, pg_net calls the website's
-- /api/notifications/send, which sends them by email (Gmail) or text (Twilio)
-- using the keys stored in Vercel. The website proves who it is with the
-- secret in notification_settings, so nobody has to copy it anywhere.

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Each member's choices, edited on My Profile.
alter table public.profiles
  add column notify_by text not null default 'email' check (notify_by in ('email', 'text', 'both', 'none')),
  add column notify_open_spots boolean not null default true,
  add column notify_thanks boolean not null default true;

-- One row: where the website lives and the secret it uses to collect messages.
create table public.notification_settings (
  id boolean primary key default true check (id),
  site_url text not null default 'https://mrbc-safety-team-web-app.vercel.app',
  secret text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
);
insert into public.notification_settings default values;
alter table public.notification_settings enable row level security;
-- No policies: only the functions below read it.

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null,  -- thanks, open_spots, greeter_reminder, test
  channel text not null check (channel in ('email', 'text')),
  recipient text not null,
  subject text,
  body text not null,
  -- Stops the same reminder from going to the same person twice.
  dedupe_key text unique,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  attempts integer not null default 0,
  sent_at timestamptz,
  error text
);
create index notification_outbox_unsent_idx on public.notification_outbox (created_at) where sent_at is null;

alter table public.notification_outbox enable row level security;
create policy "Admins can read sent messages" on public.notification_outbox
  for select to authenticated using (public.is_admin());

-- Helpers ---------------------------------------------------------------------

create or replace function public.church_day(d date)
returns text language sql immutable as $$
  select to_char(d, 'FMDay, FMMonth FMDD');
$$;

create or replace function public.church_time(t time)
returns text language sql immutable as $$
  select to_char(t, 'FMHH12:MI AM');
$$;

-- Asks the website to send whatever is queued. Never lets a problem here
-- stop a sign-up from saving.
create or replace function public.notify_dispatch()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
begin
  select * into s from public.notification_settings;
  perform net.http_post(
    url := s.site_url || '/api/notifications/send',
    headers := jsonb_build_object('Authorization', 'Bearer ' || s.secret, 'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
exception when others then
  raise warning 'notify_dispatch: %', sqlerrm;
end;
$$;

create or replace function public.queue_message(
  p_kind text, p_channel text, p_recipient text, p_subject text, p_body text, p_key text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notification_outbox (kind, channel, recipient, subject, body, dedupe_key)
  select p_kind, p_channel, btrim(p_recipient), p_subject, p_body, p_key
   where nullif(btrim(coalesce(p_recipient, '')), '') is not null
  on conflict (dedupe_key) do nothing;
$$;

-- Queues a message to a member by email, text, or both, as they chose.
create or replace function public.queue_for_member(
  p_profile public.profiles, p_kind text, p_subject text, p_body text, p_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_profile.notify_by in ('email', 'both') then
    perform public.queue_message(p_kind, 'email', p_profile.email, p_subject, p_body, p_key || ':email');
  end if;
  if p_profile.notify_by in ('text', 'both') then
    perform public.queue_message(p_kind, 'text', p_profile.phone, null, p_body, p_key || ':text');
  end if;
end;
$$;

create or replace function public.first_name(full_name text)
returns text language sql immutable as $$
  select coalesce(nullif(split_part(btrim(coalesce(full_name, '')), ' ', 1), ''), 'there');
$$;

-- Sends queued messages right away (pg_net waits until the sign-up is saved).
-- One call per transaction is enough, since the website collects everything.
create or replace function public.outbox_dispatch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from added) and coalesce(current_setting('mrbc.dispatched', true), '') <> 'yes' then
    perform set_config('mrbc.dispatched', 'yes', true);
    perform public.notify_dispatch();
  end if;
  return null;
end;
$$;

create trigger outbox_dispatch
  after insert on public.notification_outbox
  referencing new table as added
  for each statement execute function public.outbox_dispatch();

-- Thank-yous -------------------------------------------------------------------

create or replace function public.thank_for_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member public.profiles;
  ev record;
  site text := (select site_url from public.notification_settings);
begin
  select * into member from public.profiles where id = new.profile_id;
  if not found or not member.notify_thanks then
    return new;
  end if;
  select e.title, e.event_date, e.start_time, pos.name as position_name into ev
    from public.event_positions ep
    join public.events e on e.id = ep.event_id
    join public.positions pos on pos.id = ep.position_id
   where ep.id = new.event_position_id;

  perform public.queue_for_member(
    member, 'thanks', 'Thank you for signing up',
    format('Hi %s! Thank you for signing up to serve as %s at %s on %s at %s. See your schedule: %s - MRBC Safety Team',
           public.first_name(member.full_name), ev.position_name, ev.title,
           public.church_day(ev.event_date), public.church_time(ev.start_time), site),
    'thanks:' || new.id
  );
  return new;
end;
$$;

create trigger thank_for_signup
  after insert on public.signups
  for each row execute function public.thank_for_signup();

-- Greeters only give a phone number, so their thank-you is a text.
create or replace function public.thank_greeter()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  added_first boolean := new.first_service and (tg_op = 'INSERT' or not old.first_service);
  added_second boolean := new.second_service and (tg_op = 'INSERT' or not old.second_service);
  is_group boolean := exists (select 1 from public.greeter_contacts where lower(name) = lower(new.name));
  times text;
begin
  if new.phone is null or not (added_first or added_second) then
    return new;
  end if;
  times := case
    when new.first_service and new.second_service then 'the 8:30 and 11:00 services'
    when new.first_service then 'the 8:30 service'
    else 'the 11:00 service'
  end;
  perform public.queue_message(
    'thanks', 'text', new.phone, null,
    case when is_group
      then format('Thank you for signing up %s to greet before %s on %s! We''ll text a reminder the Saturday before. - MRBC Safety Team. Reply STOP to opt out.',
                  new.name, times, public.church_day(new.sunday))
      else format('Hi %s! Thank you for signing up to greet before %s on %s. We''ll text you a reminder the Saturday before. - MRBC Safety Team. Reply STOP to opt out.',
                  public.first_name(new.name), times, public.church_day(new.sunday))
    end,
    format('thanks:greeter:%s:%s%s', new.id, new.first_service, new.second_service)
  );
  return new;
end;
$$;

create trigger thank_greeter
  after insert or update of first_service, second_service on public.greeter_signups
  for each row execute function public.thank_greeter();

-- Reminders, every 10 minutes ----------------------------------------------------

create or replace function public.notify_tick()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tz constant text := 'America/Chicago';
  local_now timestamp := now() at time zone tz;
  site text := (select site_url from public.notification_settings);
  ev record;
  member public.profiles;
  stage text;
  g record;
begin
  -- Open spots: 48 and 24 hours before, but not overnight (9 PM to 7 AM);
  -- a reminder that falls overnight goes out at 7 AM instead.
  if extract(hour from local_now) between 7 and 20 then
    for ev in
      select e.id, e.title, e.event_date, e.start_time,
             (e.event_date + e.start_time) at time zone tz as starts_at,
             string_agg(format('%s (%s open)', pos.name, ep.slots - taken.n), ', ' order by pos.name) as open_list
        from public.events e
        join public.event_positions ep on ep.event_id = e.id
        join public.positions pos on pos.id = ep.position_id
        cross join lateral (select count(*)::int as n from public.signups s where s.event_position_id = ep.id) taken
       where (e.event_date + e.start_time) at time zone tz between now() and now() + interval '48 hours'
         and taken.n < ep.slots
       group by e.id
    loop
      stage := case when ev.starts_at <= now() + interval '24 hours' then '24' else '48' end;
      for member in
        select p.* from public.profiles p
         where p.active and p.notify_open_spots and p.notify_by <> 'none'
           and not exists (
             select 1 from public.signups s
               join public.event_positions ep on ep.id = s.event_position_id
              where ep.event_id = ev.id and s.profile_id = p.id)
      loop
        perform public.queue_for_member(
          member, 'open_spots',
          format('Open spots: %s on %s', ev.title, public.church_day(ev.event_date)),
          format('Hi %s! %s on %s at %s still needs people: %s. Can you help? Sign up here: %s/?month=%s&day=%s - MRBC Safety Team',
                 public.first_name(member.full_name), ev.title, public.church_day(ev.event_date),
                 public.church_time(ev.start_time), ev.open_list, site,
                 to_char(ev.event_date, 'YYYY-MM'), ev.event_date),
          format('open%s:%s:%s', stage, ev.id, member.id)
        );
      end loop;
    end loop;
  end if;

  -- Greeters: Saturday from noon on, one text per phone number for Sunday.
  if extract(isodow from local_now) = 6 and extract(hour from local_now) between 12 and 20 then
    for g in
      select regexp_replace(gs.phone, '\D', '', 'g') as digits,
             min(gs.phone) as phone, min(gs.name) as name,
             bool_or(gs.first_service) as first_service, bool_or(gs.second_service) as second_service,
             bool_or(exists (select 1 from public.greeter_contacts c where lower(c.name) = lower(gs.name))) as is_group
        from public.greeter_signups gs
       where gs.sunday = local_now::date + 1 and gs.phone is not null
       group by 1
    loop
      perform public.queue_message(
        'greeter_reminder', 'text', g.phone, null,
        format('%s Reminder: %s signed up to greet before %s tomorrow, %s. Thank you for serving! - MRBC Safety Team',
               case when g.is_group then 'Hi!' else 'Hi ' || public.first_name(g.name) || '!' end,
               case when g.is_group then g.name || ' is' else 'you''re' end,
               case
                 when g.first_service and g.second_service then 'the 8:30 and 11:00 services'
                 when g.first_service then 'the 8:30 service'
                 else 'the 11:00 service'
               end,
               public.church_day(local_now::date + 1)),
        format('greeter:%s:%s', local_now::date + 1, g.digits)
      );
    end loop;
  end if;

  -- Retry anything that didn't go out (queuing above already asked the website).
  if exists (
    select 1 from public.notification_outbox
     where sent_at is null and attempts between 1 and 2 and created_at > now() - interval '1 day'
  ) then
    perform public.notify_dispatch();
  end if;
end;
$$;

-- The website collects and reports back with the secret -------------------------

create or replace function public.notifications_claim(p_secret text)
returns setof public.notification_outbox
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.notification_settings where secret = p_secret) then
    raise exception 'Not allowed';
  end if;
  return query
    update public.notification_outbox o
       set attempts = o.attempts + 1, claimed_at = now()
     where o.id in (
       select id from public.notification_outbox
        where sent_at is null and attempts < 3
          and created_at > now() - interval '1 day'
          and (claimed_at is null or claimed_at < now() - interval '5 minutes')
        order by created_at
        limit 50
        for update skip locked)
    returning o.*;
end;
$$;

-- p_error null means sent. p_final stops retries (e.g. texting isn't set up).
create or replace function public.notifications_done(p_secret text, p_id uuid, p_error text, p_final boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.notification_settings where secret = p_secret) then
    raise exception 'Not allowed';
  end if;
  update public.notification_outbox
     set sent_at = case when p_error is null then now() end,
         error = p_error,
         attempts = case when p_final then 99 else attempts end
   where id = p_id;
end;
$$;

-- Admins send themselves a test from the Admin page.
create or replace function public.send_test_message(p_channel text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Only admins can send test messages.';
  end if;
  select * into me from public.profiles where id = auth.uid();
  if p_channel = 'text' and me.phone is null then
    raise exception 'Add your phone number on My Profile first.';
  end if;
  perform public.queue_message(
    'test', p_channel, case when p_channel = 'text' then me.phone else me.email end,
    'Test message from the MRBC Safety Team app',
    format('Hi %s! This is a test message from the MRBC Safety Team app. Automatic messages are working. - MRBC Safety Team',
           public.first_name(me.full_name)),
    'test:' || gen_random_uuid()
  );
end;
$$;

revoke all on function public.notify_dispatch() from public, anon, authenticated;
revoke all on function public.queue_message(text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.queue_for_member(public.profiles, text, text, text, text) from public, anon, authenticated;
revoke all on function public.notify_tick() from public, anon, authenticated;
revoke all on function public.notifications_claim(text) from public;
revoke all on function public.notifications_done(text, uuid, text, boolean) from public;
revoke all on function public.send_test_message(text) from public, anon;
grant execute on function public.notifications_claim(text) to anon, authenticated;
grant execute on function public.notifications_done(text, uuid, text, boolean) to anon, authenticated;
grant execute on function public.send_test_message(text) to authenticated;

select cron.schedule('mrbc-notifications', '*/10 * * * *', 'select public.notify_tick()');
