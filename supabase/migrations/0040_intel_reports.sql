-- Intel (Matt, 2026-11-01): the intelligence officer posts important things
-- going on (news, threats, events nearby) with a title, description, a link to
-- the source and a threat level. Every approved team member can read the list;
-- only people whose role has "Post intel reports" (and admins) can add, edit
-- or remove reports.

create table if not exists public.intel_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 3 and 200),
  description text not null check (length(description) between 1 and 10000),
  source_url text check (source_url is null or (length(source_url) <= 2000 and source_url ~* '^https?://')),
  threat_level text not null check (threat_level in ('high', 'medium', 'low')),
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists intel_reports_created_idx on public.intel_reports (created_at desc);

alter table public.intel_reports enable row level security;

drop policy if exists "Team members can read intel" on public.intel_reports;
create policy "Team members can read intel" on public.intel_reports
  for select to authenticated
  using (public.is_active_member());

drop policy if exists "Intel officers can post intel" on public.intel_reports;
create policy "Intel officers can post intel" on public.intel_reports
  for insert to authenticated
  with check (public.has_permission('manage_intel') and created_by = auth.uid());

drop policy if exists "Intel officers can edit intel" on public.intel_reports;
create policy "Intel officers can edit intel" on public.intel_reports
  for update to authenticated
  using (public.has_permission('manage_intel'))
  with check (public.has_permission('manage_intel'));

drop policy if exists "Intel officers can remove intel" on public.intel_reports;
create policy "Intel officers can remove intel" on public.intel_reports
  for delete to authenticated
  using (public.has_permission('manage_intel'));

-- A ready-made role for the intelligence officer: what a team member has, plus
-- posting intel. Admins give it to someone on the Safety Team Members page.
insert into public.roles (name, description, permissions)
values (
  'Intelligence Officer',
  'Posts intel reports, plus everything a team member can do.',
  array['view_watch_list', 'manage_intel']
)
on conflict (name) do nothing;
