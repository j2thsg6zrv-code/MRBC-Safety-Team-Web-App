-- Step 2: buildings, positions and events.

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  building_id uuid references public.buildings (id) on delete set null,
  -- Members need this qualification (current, not expired) to sign up.
  required_qualification_id uuid references public.qualifications (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  start_time time not null,
  end_time time,
  building_id uuid references public.buildings (id) on delete set null,
  -- Events created together as a weekly repeat share a series id.
  series_id uuid,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index events_event_date_idx on public.events (event_date);
create index events_series_id_idx on public.events (series_id);

create table public.event_positions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  position_id uuid not null references public.positions (id) on delete cascade,
  -- How many people this position needs at this event.
  slots integer not null default 1 check (slots > 0),
  unique (event_id, position_id)
);

alter table public.buildings enable row level security;
alter table public.positions enable row level security;
alter table public.events enable row level security;
alter table public.event_positions enable row level security;

create policy "Signed-in users can read buildings" on public.buildings
  for select to authenticated using (true);
create policy "Building managers can change buildings" on public.buildings
  for all to authenticated
  using (public.has_permission('manage_buildings'))
  with check (public.has_permission('manage_buildings'));

create policy "Signed-in users can read positions" on public.positions
  for select to authenticated using (true);
create policy "Position managers can change positions" on public.positions
  for all to authenticated
  using (public.has_permission('manage_positions'))
  with check (public.has_permission('manage_positions'));

create policy "Signed-in users can read events" on public.events
  for select to authenticated using (true);
create policy "Event managers can change events" on public.events
  for all to authenticated
  using (public.has_permission('manage_events'))
  with check (public.has_permission('manage_events'));

create policy "Signed-in users can read event positions" on public.event_positions
  for select to authenticated using (true);
create policy "Event managers can change event positions" on public.event_positions
  for all to authenticated
  using (public.has_permission('manage_events'))
  with check (public.has_permission('manage_events'));

-- Starter data so the pages aren't empty. Edit or delete freely.
insert into public.buildings (name) values ('Main Building');

insert into public.positions (name, description, building_id)
select p.name, p.description, b.id
from public.buildings b,
  (values
    ('Front Door', 'Greet and watch the main entrance.'),
    ('Parking Lot', 'Patrol the parking lot before and during service.'),
    ('Sanctuary', 'Watch the sanctuary during service.'),
    ('Children''s Wing', 'Watch the children''s area and check-in.')
  ) as p (name, description)
where b.name = 'Main Building';
