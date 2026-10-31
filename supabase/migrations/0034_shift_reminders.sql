-- Shift reminders (Matt, 2026-10-31):
--  * Everyone signed up for a spot gets an email 48 and 24 hours before it.
--  * Admins can email everyone signed up for upcoming shifts right away.
--  * Admins can email the whole team a list of spots that still need people.
-- Messages go through notification_outbox like every other automatic email
-- (see 0013_notifications.sql).

-- Members can turn shift reminders off on My Profile.
alter table public.profiles
  add column if not exists notify_shift_reminders boolean not null default true;

-- Midnight (church time) p_days days from today: "the next 7 days" means
-- today plus the 6 days after it, matching the Admin page's preview.
create or replace function public.church_days_ahead(p_days integer)
returns timestamptz
language sql
stable
as $$
  select (((now() at time zone 'America/Chicago')::date + p_days)::timestamp) at time zone 'America/Chicago';
$$;

-- One line per event for a member's shifts between now and p_until, e.g.
-- "- Sunday, November 2 at 9:00 AM: Sunday Service (Usher, Parking Lot)".
create or replace function public.member_shift_lines(p_profile uuid, p_until timestamptz)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select string_agg(line, E'\n' order by starts_at)
    from (
      select (e.event_date + e.start_time) at time zone 'America/Chicago' as starts_at,
             format('- %s at %s: %s (%s)', public.church_day(e.event_date), public.church_time(e.start_time),
                    e.title, string_agg(pos.name, ', ' order by pos.name)) as line
        from public.signups s
        join public.event_positions ep on ep.id = s.event_position_id
        join public.events e on e.id = ep.event_id
        join public.positions pos on pos.id = ep.position_id
       where s.profile_id = p_profile
         and (e.event_date + e.start_time) at time zone 'America/Chicago' between now() and p_until
       group by e.id
    ) shifts;
$$;

-- One line per event with spots still open between now and p_until.
create or replace function public.open_spot_lines(p_until timestamptz)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select string_agg(line, E'\n' order by starts_at)
    from (
      select (e.event_date + e.start_time) at time zone 'America/Chicago' as starts_at,
             format('- %s at %s: %s needs %s', public.church_day(e.event_date), public.church_time(e.start_time),
                    e.title, string_agg(format('%s (%s open)', pos.name, ep.slots - taken.n), ', ' order by pos.name)) as line
        from public.events e
        join public.event_positions ep on ep.event_id = e.id
        join public.positions pos on pos.id = ep.position_id
        cross join lateral (select count(*)::int as n from public.signups s where s.event_position_id = ep.id) taken
       where (e.event_date + e.start_time) at time zone 'America/Chicago' between now() and p_until
         and taken.n < ep.slots
       group by e.id
    ) events;
$$;

-- Same as 0014, plus reminders to the people serving.
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
  sh record;
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

    -- Shift reminders: 48 and 24 hours before each event a member signed up
    -- for (one email per event, listing all their positions). Someone who
    -- signed up after a reminder's time skips that one; they just got a thank-you.
    for sh in
      select s.profile_id, e.id as event_id, e.title, e.event_date, e.start_time,
             (e.event_date + e.start_time) at time zone tz as starts_at,
             string_agg(pos.name, ', ' order by pos.name) as positions,
             min(s.created_at) as signed_up_at
        from public.signups s
        join public.event_positions ep on ep.id = s.event_position_id
        join public.events e on e.id = ep.event_id
        join public.positions pos on pos.id = ep.position_id
       where (e.event_date + e.start_time) at time zone tz between now() and now() + interval '48 hours'
       group by s.profile_id, e.id
    loop
      stage := case when sh.starts_at <= now() + interval '24 hours' then '24' else '48' end;
      continue when sh.signed_up_at > sh.starts_at - make_interval(hours => stage::int);
      select * into member from public.profiles p
       where p.id = sh.profile_id and p.active and p.notify_shift_reminders and p.notify_by <> 'none';
      continue when not found;
      perform public.queue_for_member(
        member, 'shift_reminder',
        format('Reminder: %s on %s at %s', sh.title, public.church_day(sh.event_date), public.church_time(sh.start_time)),
        format(E'Hi %s! This is a reminder that you''re signed up to serve as %s at %s on %s at %s.\n\nIf you can''t make it, please take your name off the calendar so someone else can fill the spot: %s/?month=%s&day=%s\n\nThank you for serving! - MRBC Safety Team',
               public.first_name(member.full_name), sh.positions, sh.title, public.church_day(sh.event_date),
               public.church_time(sh.start_time), site, to_char(sh.event_date, 'YYYY-MM'), sh.event_date),
        format('shift%s:%s:%s', stage, sh.event_id, member.id)
      );
    end loop;
  end if;

  -- Greeters: Saturday from noon on, one email per address for Sunday.
  -- Groups like Youth Group without their own email use their leader's.
  if extract(isodow from local_now) = 6 and extract(hour from local_now) between 12 and 20 then
    for g in
      select lower(coalesce(gs.email, c.email)) as address,
             min(gs.name) as name,
             bool_or(gs.first_service) as first_service, bool_or(gs.second_service) as second_service,
             bool_or(c.id is not null) as is_group
        from public.greeter_signups gs
        left join public.greeter_contacts c on lower(c.name) = lower(gs.name)
       where gs.sunday = local_now::date + 1 and coalesce(gs.email, c.email) is not null
       group by 1
    loop
      perform public.queue_message(
        'greeter_reminder', 'email', g.address, 'Reminder: greeting tomorrow',
        format('%s Reminder: %s signed up to greet before %s tomorrow, %s. Thank you for serving! - MRBC Safety Team',
               case when g.is_group then 'Hi!' else 'Hi ' || public.first_name(g.name) || '!' end,
               case when g.is_group then g.name || ' is' else 'you''re' end,
               case
                 when g.first_service and g.second_service then 'the 8:30 and 11:00 services'
                 when g.first_service then 'the 8:30 service'
                 else 'the 11:00 service'
               end,
               public.church_day(local_now::date + 1)),
        format('greeter:%s:%s', local_now::date + 1, g.address)
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

-- Admin button: email everyone signed up for a shift in the next p_days days
-- a list of their shifts. Returns how many people it emailed.
create or replace function public.send_shift_reminders(p_days integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  site text := (select site_url from public.notification_settings);
  member public.profiles;
  lines text;
  sent integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Only admins can send reminders.';
  end if;
  if p_days is null or p_days < 1 or p_days > 60 then
    raise exception 'Pick between 1 and 60 days.';
  end if;
  for member in
    select p.* from public.profiles p
     where p.active and p.notify_by <> 'none'
       and exists (
         select 1 from public.signups s
           join public.event_positions ep on ep.id = s.event_position_id
           join public.events e on e.id = ep.event_id
          where s.profile_id = p.id
            and (e.event_date + e.start_time) at time zone 'America/Chicago'
                between now() and public.church_days_ahead(p_days))
  loop
    lines := public.member_shift_lines(member.id, public.church_days_ahead(p_days));
    continue when lines is null;
    perform public.queue_for_member(
      member, 'shift_reminder', 'Reminder: your upcoming safety team shifts',
      format(E'Hi %s! This is a reminder that you''re signed up to serve:\n\n%s\n\nIf you can''t make it, please take your name off the calendar so someone else can fill the spot: %s\n\nThank you for serving! - MRBC Safety Team',
             public.first_name(member.full_name), lines, site),
      'shift-now:' || gen_random_uuid()
    );
    sent := sent + 1;
  end loop;
  if sent = 0 then
    raise exception 'Nobody is signed up for a shift in the next % days.', p_days;
  end if;
  return sent;
end;
$$;

-- Admin button: email every active member the spots that still need people in
-- the next p_days days. Returns how many people it emailed.
create or replace function public.send_open_spots_alert(p_days integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  site text := (select site_url from public.notification_settings);
  member public.profiles;
  lines text;
  sent integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Only admins can send this.';
  end if;
  if p_days is null or p_days < 1 or p_days > 60 then
    raise exception 'Pick between 1 and 60 days.';
  end if;
  lines := public.open_spot_lines(public.church_days_ahead(p_days));
  if lines is null then
    raise exception 'Every spot in the next % days is filled. Nothing to send.', p_days;
  end if;
  for member in
    select p.* from public.profiles p where p.active and p.notify_by <> 'none'
  loop
    perform public.queue_for_member(
      member, 'open_spots', 'Safety team spots that need filling',
      format(E'Hi %s! We still have spots on the safety team schedule that need people:\n\n%s\n\nCan you help? Sign up here: %s\n\nThank you! - MRBC Safety Team',
             public.first_name(member.full_name), lines, site),
      'open-now:' || gen_random_uuid()
    );
    sent := sent + 1;
  end loop;
  return sent;
end;
$$;

revoke all on function public.member_shift_lines(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.open_spot_lines(timestamptz) from public, anon, authenticated;
revoke all on function public.send_shift_reminders(integer) from public, anon;
revoke all on function public.send_open_spots_alert(integer) from public, anon;
grant execute on function public.send_shift_reminders(integer) to authenticated;
grant execute on function public.send_open_spots_alert(integer) to authenticated;
