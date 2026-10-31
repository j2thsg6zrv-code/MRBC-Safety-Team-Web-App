-- Outside certifications (Matt, 2026-10-31).
-- My Certifications is now for certifications earned outside the app, such as
-- CPR. Members type the name, where they got it, the date and when it expires.
-- Certifications from training classes are still added automatically when a
-- member passes a class, but members can no longer add or change those
-- themselves (admins and "Manage team members" still can, on a member's page).

create table if not exists public.outside_certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  issued_by text,
  earned_on date not null,
  expires_on date,
  created_at timestamptz not null default now(),
  check (expires_on is null or expires_on >= earned_on)
);
create index if not exists outside_certifications_profile_id_idx on public.outside_certifications (profile_id);

alter table public.outside_certifications enable row level security;

drop policy if exists "Approved members can read outside certifications" on public.outside_certifications;
create policy "Approved members can read outside certifications" on public.outside_certifications
  for select to authenticated using (profile_id = (select auth.uid()) or public.is_active_member());
drop policy if exists "Members can change their own outside certifications" on public.outside_certifications;
create policy "Members can change their own outside certifications" on public.outside_certifications
  for all to authenticated
  using (profile_id = (select auth.uid()) and public.is_active_member())
  with check (profile_id = (select auth.uid()) and public.is_active_member());
drop policy if exists "Member managers can change outside certifications" on public.outside_certifications;
create policy "Member managers can change outside certifications" on public.outside_certifications
  for all to authenticated
  using (public.has_permission('manage_members'))
  with check (public.has_permission('manage_members'));

-- Training certifications come only from passing a class (or an admin).
drop policy if exists "Members can change their own certifications" on public.member_certifications;
