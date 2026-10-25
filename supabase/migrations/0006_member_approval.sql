-- New sign-ups wait for an admin to approve them before they can see
-- anything, since the app holds the watch list and members' contact details.

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active);
$$;

alter table public.profiles alter column active set default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean := not exists (select 1 from public.profiles);
  assigned_role uuid;
begin
  if is_first then
    select id into assigned_role from public.roles where name = 'Admin';
  else
    select id into assigned_role from public.roles where is_default limit 1;
  end if;

  insert into public.profiles (id, email, full_name, role_id, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    assigned_role,
    is_first  -- the first person (the admin) is approved automatically
  );
  return new;
end;
$$;

-- Reads now need an approved account. Everyone can still read their own profile.

drop policy "Signed-in users can read profiles" on public.profiles;
create policy "Approved members can read profiles" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_active_member());

drop policy "Signed-in users can read qualifications" on public.qualifications;
create policy "Approved members can read qualifications" on public.qualifications
  for select to authenticated using (public.is_active_member());

drop policy "Signed-in users can read member qualifications" on public.member_qualifications;
create policy "Approved members can read member qualifications" on public.member_qualifications
  for select to authenticated using (profile_id = auth.uid() or public.is_active_member());

drop policy "Signed-in users can read buildings" on public.buildings;
create policy "Approved members can read buildings" on public.buildings
  for select to authenticated using (public.is_active_member());

drop policy "Signed-in users can read positions" on public.positions;
create policy "Approved members can read positions" on public.positions
  for select to authenticated using (public.is_active_member());

drop policy "Signed-in users can read events" on public.events;
create policy "Approved members can read events" on public.events
  for select to authenticated using (public.is_active_member());

drop policy "Signed-in users can read event positions" on public.event_positions;
create policy "Approved members can read event positions" on public.event_positions
  for select to authenticated using (public.is_active_member());

drop policy "Signed-in users can read sign-ups" on public.signups;
create policy "Approved members can read sign-ups" on public.signups
  for select to authenticated using (public.is_active_member());

drop policy "Anyone on the team can file a report" on public.incident_reports;
create policy "Approved members can file a report" on public.incident_reports
  for insert to authenticated
  with check (reported_by = auth.uid() and public.is_active_member());
