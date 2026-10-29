-- Members add their own qualifications and certifications (Matt, 2026-10-29).
-- Every approved member can add, renew and remove qualifications on their own
-- profile and add new kinds of qualification to the list. Certifications work
-- the same way, except only admins create the kinds of certification. Members
-- with "Manage team members" (and admins) can still do this for anyone.

create policy "Members can change their own qualifications" on public.member_qualifications
  for all to authenticated
  using (profile_id = auth.uid() and public.is_active_member())
  with check (profile_id = auth.uid() and public.is_active_member());

create policy "Approved members can add qualifications" on public.qualifications
  for insert to authenticated with check (public.is_active_member());

-- Certifications -------------------------------------------------------------

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  -- How long the certification lasts. Null means it never expires.
  valid_months integer check (valid_months is null or valid_months > 0),
  created_at timestamptz not null default now()
);

create table public.member_certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  certification_id uuid not null references public.certifications (id) on delete cascade,
  earned_on date not null,
  expires_on date,
  created_at timestamptz not null default now(),
  unique (profile_id, certification_id)
);

alter table public.certifications enable row level security;
alter table public.member_certifications enable row level security;

create policy "Approved members can read certifications" on public.certifications
  for select to authenticated using (public.is_active_member());
create policy "Admins can change certifications" on public.certifications
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Approved members can read member certifications" on public.member_certifications
  for select to authenticated using (profile_id = auth.uid() or public.is_active_member());
create policy "Members can change their own certifications" on public.member_certifications
  for all to authenticated
  using (profile_id = auth.uid() and public.is_active_member())
  with check (profile_id = auth.uid() and public.is_active_member());
create policy "Member managers can change member certifications" on public.member_certifications
  for all to authenticated
  using (public.has_permission('manage_members'))
  with check (public.has_permission('manage_members'));
