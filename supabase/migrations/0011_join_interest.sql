-- "Join the safety team": anyone (no login) leaves their name, phone, email
-- and the best time to call. The public page only calls join_team_interest()
-- below, so visitors can add themselves but never read anyone's details.
-- Admins see the list on the Admin page and follow up.

create table public.join_interest (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 80),
  phone text not null check (length(phone) between 7 and 30),
  email text not null check (length(email) between 3 and 200),
  best_time text not null check (best_time in ('morning', 'afternoon', 'evening')),
  -- Set when an admin has reached out to them.
  contacted_at timestamptz,
  created_at timestamptz not null default now()
);

create index join_interest_created_idx on public.join_interest (created_at desc);

alter table public.join_interest enable row level security;

-- Admins only. Anonymous visitors and other members get no direct access.
create policy "Admins can read join interest" on public.join_interest
  for select to authenticated using (public.is_admin());
create policy "Admins can update join interest" on public.join_interest
  for update to authenticated using (public.is_admin());
create policy "Admins can delete join interest" on public.join_interest
  for delete to authenticated using (public.is_admin());

create or replace function public.join_team_interest(
  p_name text,
  p_phone text,
  p_email text,
  p_best_time text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text := btrim(p_name);
  clean_phone text := btrim(p_phone);
  clean_email text := lower(btrim(p_email));
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if clean_name is null or length(clean_name) < 2 or length(clean_name) > 80 then
    raise exception 'Please enter your name.';
  end if;
  if length(digits) < 10 or length(digits) > 15 or length(clean_phone) > 30 then
    raise exception 'Please enter a phone number with area code.';
  end if;
  if clean_email is null or length(clean_email) > 200 or clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address.';
  end if;
  if p_best_time is null or p_best_time not in ('morning', 'afternoon', 'evening') then
    raise exception 'Please choose morning, afternoon or evening.';
  end if;

  -- Filling the form in again just updates their earlier answer.
  update public.join_interest
     set name = clean_name, phone = clean_phone, best_time = p_best_time
   where email = clean_email and contacted_at is null;
  if found then
    return;
  end if;

  -- A guard against someone flooding the public form.
  if (select count(*) from public.join_interest where created_at > now() - interval '1 day') >= 50 then
    raise exception 'We''ve had a lot of responses today. Please try again tomorrow.';
  end if;

  insert into public.join_interest (name, phone, email, best_time)
  values (clean_name, clean_phone, clean_email, p_best_time);
end;
$$;

revoke all on function public.join_team_interest(text, text, text, text) from public;
grant execute on function public.join_team_interest(text, text, text, text) to anon, authenticated;
