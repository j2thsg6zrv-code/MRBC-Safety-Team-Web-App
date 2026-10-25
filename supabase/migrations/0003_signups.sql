-- Step 3: members sign up for positions at events.

create table public.signups (
  id uuid primary key default gen_random_uuid(),
  event_position_id uuid not null references public.event_positions (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_position_id, profile_id)
);

create index signups_profile_id_idx on public.signups (profile_id);

-- Checks every new sign-up: the spot is still open, the person isn't already
-- serving at that event, holds any required qualification, and the event
-- hasn't happened yet. Event managers may skip the qualification check.
create or replace function public.check_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target record;
  taken integer;
begin
  -- Lock the position so two people can't grab the last spot at once.
  select ep.slots, ep.event_id, e.event_date, p.required_qualification_id, q.name as qualification_name
    into target
    from public.event_positions ep
    join public.events e on e.id = ep.event_id
    join public.positions p on p.id = ep.position_id
    left join public.qualifications q on q.id = p.required_qualification_id
   where ep.id = new.event_position_id
     for update of ep;

  if target.event_date < current_date - 1 then
    raise exception 'This event has already happened.';
  end if;

  select count(*) into taken from public.signups where event_position_id = new.event_position_id;
  if taken >= target.slots then
    raise exception 'Sorry, this position is already full.';
  end if;

  if exists (
    select 1 from public.signups s
    join public.event_positions other on other.id = s.event_position_id
    where other.event_id = target.event_id and s.profile_id = new.profile_id
  ) then
    raise exception 'Already signed up for another position at this event.';
  end if;

  if target.required_qualification_id is not null
     and not public.has_permission('manage_events')
     and not exists (
       select 1 from public.member_qualifications mq
       where mq.profile_id = new.profile_id
         and mq.qualification_id = target.required_qualification_id
         and (mq.expires_on is null or mq.expires_on >= target.event_date)
     ) then
    raise exception 'This position requires a current % qualification.', target.qualification_name;
  end if;

  return new;
end;
$$;

create trigger check_signup
  before insert on public.signups
  for each row execute function public.check_signup();

alter table public.signups enable row level security;

create policy "Signed-in users can read sign-ups" on public.signups
  for select to authenticated using (true);
create policy "Members sign themselves up; event managers sign up anyone" on public.signups
  for insert to authenticated
  with check (
    (profile_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid() and active))
    or public.has_permission('manage_events')
  );
create policy "Members cancel their own sign-ups; event managers cancel any" on public.signups
  for delete to authenticated
  using (profile_id = auth.uid() or public.has_permission('manage_events'));
