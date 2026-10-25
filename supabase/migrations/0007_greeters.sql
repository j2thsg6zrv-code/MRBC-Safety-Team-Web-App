-- Greeters: anyone (no login) signs up to greet before a Sunday service.
-- The public page never reads the table directly. It calls the two functions
-- below, which return first names and last initials, never phone numbers.

create table public.greeter_signups (
  id uuid primary key default gen_random_uuid(),
  sunday date not null check (extract(isodow from sunday) = 7),
  name text not null check (length(name) between 1 and 80),
  phone text not null check (length(phone) between 7 and 30),
  -- Which services they'll greet before.
  first_service boolean not null default false,   -- 8:30
  second_service boolean not null default false,  -- 11:00
  created_at timestamptz not null default now(),
  check (first_service or second_service)
);

create index greeter_signups_sunday_idx on public.greeter_signups (sunday);

alter table public.greeter_signups enable row level security;

-- Approved members see everything, phones included. Event managers can
-- correct or remove sign-ups. Anonymous visitors get no direct access.
create policy "Approved members can read greeter sign-ups" on public.greeter_signups
  for select to authenticated using (public.is_active_member());
create policy "Event managers can update greeter sign-ups" on public.greeter_signups
  for update to authenticated using (public.has_permission('manage_events'));
create policy "Event managers can delete greeter sign-ups" on public.greeter_signups
  for delete to authenticated using (public.has_permission('manage_events'));

-- The public schedule: first name and last initial only ("Mary Jones" -> "Mary J.").
create or replace function public.greeter_schedule(from_date date, to_date date)
returns table (sunday date, name text, first_service boolean, second_service boolean)
language sql
stable
security definer
set search_path = public
as $$
  select g.sunday,
         case
           when position(' ' in g.name) = 0 then g.name
           else split_part(g.name, ' ', 1) || ' ' || left(regexp_replace(g.name, '^.*\s', ''), 1) || '.'
         end,
         g.first_service, g.second_service
    from public.greeter_signups g
   where g.sunday between from_date and least(to_date, from_date + 120)
   order by g.sunday, g.created_at;
$$;

-- The public sign-up. Signing up again for the same Sunday with the same
-- phone number adds the services to the existing sign-up instead of
-- duplicating it.
create or replace function public.greeter_sign_up(
  p_sunday date,
  p_name text,
  p_phone text,
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
  clean_phone text := btrim(p_phone);
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
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
  if length(digits) < 10 or length(digits) > 15 or length(clean_phone) > 30 then
    raise exception 'Please enter a phone number with area code.';
  end if;
  if not (coalesce(p_first_service, false) or coalesce(p_second_service, false)) then
    raise exception 'Please choose the 8:30 service, the 11:00 service, or both.';
  end if;

  select id into existing
    from public.greeter_signups
   where sunday = p_sunday
     and regexp_replace(phone, '\D', '', 'g') = digits
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

  insert into public.greeter_signups (sunday, name, phone, first_service, second_service)
  values (p_sunday, clean_name, clean_phone, coalesce(p_first_service, false), coalesce(p_second_service, false));
end;
$$;

revoke all on function public.greeter_schedule(date, date) from public;
revoke all on function public.greeter_sign_up(date, text, text, boolean, boolean) from public;
grant execute on function public.greeter_schedule(date, date) to anon, authenticated;
grant execute on function public.greeter_sign_up(date, text, text, boolean, boolean) to anon, authenticated;
