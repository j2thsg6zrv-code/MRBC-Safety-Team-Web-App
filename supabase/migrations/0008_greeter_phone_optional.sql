-- Greeters may leave their phone number blank (Matt, 2026-10-25).

alter table public.greeter_signups alter column phone drop not null;

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

  -- Signing up again for the same Sunday (same phone, or same name when no
  -- phone was given) adds the services to the existing sign-up.
  select id into existing
    from public.greeter_signups
   where sunday = p_sunday
     and case
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
