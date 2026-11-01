-- "Interested in serving": anyone (no login) who wants to serve at MRBC but
-- isn't sure where leaves their name, phone, email, best time to call and an
-- optional note. Each answer is saved here and emailed to the people who
-- help them find a place to serve (Matt, 2026-11-01). The public page only
-- calls serve_interest_submit(), so visitors can never read anyone's details.

create table public.serve_interest (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 80),
  phone text not null check (length(phone) between 7 and 30),
  email text not null check (length(email) between 3 and 200),
  best_time text not null check (best_time in ('morning', 'afternoon', 'evening')),
  note text check (length(note) <= 1000),
  created_at timestamptz not null default now()
);

create index serve_interest_created_idx on public.serve_interest (created_at desc);

alter table public.serve_interest enable row level security;

create policy "Admins can read serve interest" on public.serve_interest
  for select to authenticated using (public.is_admin());
create policy "Admins can delete serve interest" on public.serve_interest
  for delete to authenticated using (public.is_admin());

-- Who gets the email for each answer.
create or replace function public.serve_interest_recipients()
returns text[]
language sql
immutable
as $$
  select array['mrbcsafety@gmail.com', 'jana@matthewroad.org'];
$$;

create or replace function public.serve_interest_submit(
  p_name text,
  p_phone text,
  p_email text,
  p_best_time text,
  p_note text default null
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
  clean_note text := nullif(btrim(coalesce(p_note, '')), '');
  digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  new_id uuid;
  recipient text;
  time_label text;
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
  if clean_note is not null and length(clean_note) > 1000 then
    raise exception 'Please keep your note under 1000 characters.';
  end if;

  -- A guard against someone flooding the public form.
  if (select count(*) from public.serve_interest where created_at > now() - interval '1 day') >= 50 then
    raise exception 'We''ve had a lot of responses today. Please try again tomorrow.';
  end if;
  -- The same person sending twice within an hour is a double tap, not news.
  if exists (select 1 from public.serve_interest
              where email = clean_email and created_at > now() - interval '1 hour') then
    return;
  end if;

  insert into public.serve_interest (name, phone, email, best_time, note)
  values (clean_name, clean_phone, clean_email, p_best_time, clean_note)
  returning id into new_id;

  time_label := initcap(p_best_time);
  foreach recipient in array public.serve_interest_recipients() loop
    perform public.queue_message(
      'serve_interest', 'email', recipient,
      format('%s is interested in serving at MRBC', clean_name),
      format(E'%s would like to serve at MRBC but isn''t sure where yet.\n\nName: %s\nPhone: %s\nEmail: %s\nBest time to contact: %s',
             clean_name, clean_name, clean_phone, clean_email, time_label)
        || coalesce(E'\nNote: ' || clean_note, '')
        || E'\n\nThey filled in the "Interested in serving" form. Please reach out to them. - MRBC Safety Team',
      format('serve_interest:%s:%s', new_id, recipient)
    );
  end loop;
end;
$$;

revoke all on function public.serve_interest_submit(text, text, text, text, text) from public;
grant execute on function public.serve_interest_submit(text, text, text, text, text) to anon, authenticated;
