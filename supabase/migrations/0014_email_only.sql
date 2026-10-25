-- Messages go by email only (Matt, 2026-10-25), so nobody needs a texting
-- subscription. Greeters now leave an email address instead of a phone
-- number; earlier sign-ups keep their phone numbers.

alter table public.greeter_signups
  add column email text check (email is null or (length(email) between 3 and 200 and email like '%_@_%'));

alter table public.greeter_contacts
  add column email text check (email is null or (length(email) between 3 and 200 and email like '%_@_%')),
  alter column phone drop not null;

-- Members: email or nothing.
update public.profiles set notify_by = 'email' where notify_by in ('text', 'both');
alter table public.profiles drop constraint if exists profiles_notify_by_check;
alter table public.profiles add constraint profiles_notify_by_check check (notify_by in ('email', 'none'));

-- The public sign-up takes an email address now.
drop function if exists public.greeter_sign_up(date, text, text, boolean, boolean);

create or replace function public.greeter_sign_up(
  p_sunday date,
  p_name text,
  p_email text,
  p_first_service boolean,
  p_second_service boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  church_today date := (now() at time zone 'America/Chicago')::date;
  clean_name text := btrim(p_name);
  clean_email text := lower(nullif(btrim(coalesce(p_email, '')), ''));
  existing uuid;
begin
  if p_sunday is null or extract(isodow from p_sunday) <> 7 then
    raise exception 'Please pick a Sunday.';
  end if;
  if p_sunday < church_today or p_sunday > church_today + 120 then
    raise exception 'Please pick one of the upcoming Sundays.';
  end if;
  if clean_name is null or length(clean_name) < 2 or length(clean_name) > 80 then
    raise exception 'Please enter your name.';
  end if;
  if clean_email is not null and (length(clean_email) > 200 or clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'Please check your email address, or leave it blank.';
  end if;
  if not (coalesce(p_first_service, false) or coalesce(p_second_service, false)) then
    raise exception 'Please choose the 8:30 service, the 11:00 service, or both.';
  end if;

  -- Signing up again for the same Sunday (same email, or same name when no
  -- email was given) adds the services to the existing sign-up.
  select id into existing
    from public.greeter_signups
   where sunday = p_sunday
     and case
           when clean_email is not null then lower(email) = clean_email
           else email is null and lower(name) = lower(clean_name)
         end
   limit 1;

  if existing is not null then
    update public.greeter_signups
       set name = clean_name,
           first_service = first_service or coalesce(p_first_service, false),
           second_service = second_service or coalesce(p_second_service, false)
     where id = existing;
    return;
  end if;

  -- A guard against someone flooding the public form.
  if (select count(*) from public.greeter_signups where sunday = p_sunday) >= 30 then
    raise exception 'That Sunday already has plenty of greeters. Please pick another.';
  end if;

  insert into public.greeter_signups (sunday, name, email, first_service, second_service)
  values (p_sunday, clean_name, clean_email, coalesce(p_first_service, false), coalesce(p_second_service, false));
end;
$$;

revoke all on function public.greeter_sign_up(date, text, text, boolean, boolean) from public;
grant execute on function public.greeter_sign_up(date, text, text, boolean, boolean) to anon, authenticated;

-- Greeter thank-yous go by email (or to the group leader's email).
create or replace function public.thank_greeter()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  added_first boolean := new.first_service and (tg_op = 'INSERT' or not old.first_service);
  added_second boolean := new.second_service and (tg_op = 'INSERT' or not old.second_service);
  group_email text;
  is_group boolean;
  times text;
begin
  select email into group_email from public.greeter_contacts where lower(name) = lower(new.name);
  is_group := found;
  if coalesce(new.email, group_email) is null or not (added_first or added_second) then
    return new;
  end if;
  times := case
    when new.first_service and new.second_service then 'the 8:30 and 11:00 services'
    when new.first_service then 'the 8:30 service'
    else 'the 11:00 service'
  end;
  perform public.queue_message(
    'thanks', 'email', coalesce(new.email, group_email), 'Thank you for signing up to greet',
    case when is_group
      then format('Thank you for signing up %s to greet before %s on %s! We''ll send a reminder the Saturday before. - MRBC Safety Team',
                  new.name, times, public.church_day(new.sunday))
      else format('Hi %s! Thank you for signing up to greet before %s on %s. We''ll email you a reminder the Saturday before. - MRBC Safety Team',
                  public.first_name(new.name), times, public.church_day(new.sunday))
    end,
    format('thanks:greeter:%s:%s%s', new.id, new.first_service, new.second_service)
  );
  return new;
end;
$$;

-- Same as before, except greeters are reminded by email.
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
