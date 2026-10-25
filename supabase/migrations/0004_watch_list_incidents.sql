-- Step 4: watch list and incident reports.

-- Watch list ----------------------------------------------------------------

create table public.watch_list (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  aliases text,
  status text not null default 'watch' check (status in ('watch', 'banned')),
  description text,         -- what they look like
  reason text,              -- why they're on the list
  vehicle text,
  instructions text,        -- what the team should do if they're seen
  banned_until date,
  photo_path text,          -- file in the watch-list storage bucket
  archived boolean not null default false,
  added_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.watch_list enable row level security;

create policy "Watch list viewers can read it" on public.watch_list
  for select to authenticated
  using (public.has_permission('view_watch_list') or public.has_permission('manage_watch_list'));
create policy "Watch list managers can change it" on public.watch_list
  for all to authenticated
  using (public.has_permission('manage_watch_list'))
  with check (public.has_permission('manage_watch_list'));

-- Photos live in a private bucket; the app shows them through short-lived links.
insert into storage.buckets (id, name, public)
values ('watch-list', 'watch-list', false)
on conflict (id) do nothing;

create policy "Watch list viewers can see photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'watch-list'
    and (public.has_permission('view_watch_list') or public.has_permission('manage_watch_list'))
  );
create policy "Watch list managers can upload photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'watch-list' and public.has_permission('manage_watch_list'));
create policy "Watch list managers can delete photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'watch-list' and public.has_permission('manage_watch_list'));

-- Incident reports ----------------------------------------------------------

create table public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  incident_date date not null,
  incident_time time,
  category text not null,
  severity text not null default 'low' check (severity in ('low', 'medium', 'high')),
  building_id uuid references public.buildings (id) on delete set null,
  location text,            -- where in the building
  event_id uuid references public.events (id) on delete set null,
  description text not null,
  people_involved text,
  actions_taken text,
  police_called boolean not null default false,
  ems_called boolean not null default false,
  watch_list_id uuid references public.watch_list (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'closed')),
  follow_up_notes text,
  reported_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index incident_reports_date_idx on public.incident_reports (incident_date desc);

alter table public.incident_reports enable row level security;

create policy "Anyone on the team can file a report" on public.incident_reports
  for insert to authenticated
  with check (reported_by = auth.uid());
create policy "Reporters see their own reports; viewers see all" on public.incident_reports
  for select to authenticated
  using (
    reported_by = auth.uid()
    or public.has_permission('view_incidents')
    or public.has_permission('manage_incidents')
  );
create policy "Reporters can edit their open reports" on public.incident_reports
  for update to authenticated
  using (reported_by = auth.uid() and status = 'open')
  with check (reported_by = auth.uid() and status = 'open');
create policy "Incident managers can edit any report" on public.incident_reports
  for update to authenticated
  using (public.has_permission('manage_incidents'))
  with check (public.has_permission('manage_incidents'));
create policy "Incident managers can delete reports" on public.incident_reports
  for delete to authenticated
  using (public.has_permission('manage_incidents'));
