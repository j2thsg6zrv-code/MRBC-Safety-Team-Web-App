-- Group greeters (e.g. "Youth Group") whose sign-ups automatically use their
-- leader's phone number, so reminder texts reach the leader. Event managers
-- edit the list on the Greeters page.

create table public.greeter_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 2 and 80),
  phone text not null check (length(phone) between 7 and 30),
  -- Who the number belongs to, e.g. "Brennan Wolfe, youth group leader".
  contact_name text,
  created_at timestamptz not null default now()
);

create unique index greeter_contacts_name_idx on public.greeter_contacts (lower(name));

alter table public.greeter_contacts enable row level security;

create policy "Approved members can read greeter contacts" on public.greeter_contacts
  for select to authenticated using (public.is_active_member());
create policy "Event managers can change greeter contacts" on public.greeter_contacts
  for all to authenticated
  using (public.has_permission('manage_events'))
  with check (public.has_permission('manage_events'));

insert into public.greeter_contacts (name, phone, contact_name)
values ('Youth Group', '(806) 577-5546', 'Brennan Wolfe, youth group leader');

-- Existing sign-ups by a listed group with no phone get the group's number.
update public.greeter_signups g
   set phone = c.phone
  from public.greeter_contacts c
 where g.phone is null and lower(g.name) = lower(c.name);

-- The public schedule shows a group's full name ("Youth Group", not "Youth G.").
create or replace function public.greeter_schedule(from_date date, to_date date)
returns table (sunday date, name text, first_service boolean, second_service boolean)
language sql
stable
security definer
set search_path = public
as $$
  select g.sunday,
         case
           when position(' ' in g.name) = 0
             or exists (select 1 from public.greeter_contacts c where lower(c.name) = lower(g.name)) then g.name
           else split_part(g.name, ' ', 1) || ' ' || left(regexp_replace(g.name, '^.*\s', ''), 1) || '.'
         end,
         g.first_service, g.second_service
    from public.greeter_signups g
   where g.sunday between from_date and least(to_date, from_date + 120)
   order by g.sunday, g.created_at;
$$;

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
  clean_phone text := nullif(btrim(coalesce(p_phone, '')), '');
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  existing uuid;
  group_phone text;
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
  if clean_phone is not null and (length(digits) < 10 or length(digits) > 15 or length(clean_phone) > 30) then
    raise exception 'Please enter a phone number with area code, or leave it blank.';
  end if;
  if not (coalesce(p_first_service, false) or coalesce(p_second_service, false)) then
    raise exception 'Please choose the 8:30 service, the 11:00 service, or both.';
  end if;

  -- Groups like "Youth Group" use their leader's number when none is given.
  if clean_phone is null then
    select phone into group_phone from public.greeter_contacts where lower(name) = lower(clean_name);
    if group_phone is not null then
      clean_phone := group_phone;
      digits := regexp_replace(group_phone, '\D', '', 'g');
    end if;
  end if;

  -- Signing up again for the same Sunday (same phone, or same name when no
  -- phone was given) adds the services to the existing sign-up.
  select id into existing
    from public.greeter_signups
   where sunday = p_sunday
     and case
           when group_phone is not null then lower(name) = lower(clean_name)
           when clean_phone is not null then regexp_replace(coalesce(phone, ''), '\D', '', 'g') = digits
           else phone is null and lower(name) = lower(clean_name)
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

  insert into public.greeter_signups (sunday, name, phone, first_service, second_service)
  values (p_sunday, clean_name, clean_phone, coalesce(p_first_service, false), coalesce(p_second_service, false));
end;
$$;
