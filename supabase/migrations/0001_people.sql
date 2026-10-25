-- Step 1: people, roles & permissions, qualifications.
-- Run this in the Supabase SQL editor (or with `supabase db push`).

-- Roles ---------------------------------------------------------------------

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  -- Permission keys, see src/lib/permissions.ts for the full list.
  permissions text[] not null default '{}',
  -- The role new sign-ups receive. Exactly one role should have this set.
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.roles (name, description, permissions, is_default) values
  ('Admin', 'Full access to everything.', array[
    'manage_members', 'manage_roles', 'manage_qualifications',
    'manage_buildings', 'manage_positions', 'manage_events',
    'view_watch_list', 'manage_watch_list',
    'view_incidents', 'manage_incidents'
  ], false),
  ('Team Leader', 'Schedules events and manages the watch list.', array[
    'manage_events', 'view_watch_list', 'manage_watch_list', 'view_incidents'
  ], false),
  ('Team Member', 'Signs up for positions and files incident reports.', array[
    'view_watch_list'
  ], true);

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  role_id uuid references public.roles (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Qualifications ------------------------------------------------------------

create table public.qualifications (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  -- How long the qualification lasts. Null means it never expires.
  valid_months integer check (valid_months is null or valid_months > 0),
  created_at timestamptz not null default now()
);

insert into public.qualifications (name, description, valid_months) values
  ('CPR', 'Cardiopulmonary resuscitation certification.', 24),
  ('First Aid', 'Basic first aid certification.', 24),
  ('Stop the Bleed', 'Bleeding control training.', 36);

create table public.member_qualifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  qualification_id uuid not null references public.qualifications (id) on delete cascade,
  earned_on date not null,
  expires_on date,
  created_at timestamptz not null default now(),
  unique (profile_id, qualification_id)
);

-- Permission helper ---------------------------------------------------------

create or replace function public.has_permission(perm text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = auth.uid()
      and p.active
      and perm = any (r.permissions)
  );
$$;

-- New sign-ups get a profile. The very first person becomes Admin.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role uuid;
begin
  if not exists (select 1 from public.profiles) then
    select id into assigned_role from public.roles where name = 'Admin';
  else
    select id into assigned_role from public.roles where is_default limit 1;
  end if;

  insert into public.profiles (id, email, full_name, role_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    assigned_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Members may edit their own profile, but not their role or active flag.

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null for the Supabase SQL editor and other admin tools.
  if (new.role_id is distinct from old.role_id or new.active is distinct from old.active)
     and auth.uid() is not null
     and not public.has_permission('manage_members') then
    raise exception 'Only members with the manage_members permission can change roles or active status';
  end if;
  return new;
end;
$$;

create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Row level security --------------------------------------------------------

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.qualifications enable row level security;
alter table public.member_qualifications enable row level security;

create policy "Signed-in users can read roles" on public.roles
  for select to authenticated using (true);
create policy "Role managers can change roles" on public.roles
  for all to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));

create policy "Signed-in users can read profiles" on public.profiles
  for select to authenticated using (true);
create policy "Members can update their own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "Member managers can update any profile" on public.profiles
  for update to authenticated
  using (public.has_permission('manage_members'))
  with check (public.has_permission('manage_members'));
create policy "Member managers can delete profiles" on public.profiles
  for delete to authenticated using (public.has_permission('manage_members'));

create policy "Signed-in users can read qualifications" on public.qualifications
  for select to authenticated using (true);
create policy "Qualification managers can change qualifications" on public.qualifications
  for all to authenticated
  using (public.has_permission('manage_qualifications'))
  with check (public.has_permission('manage_qualifications'));

create policy "Signed-in users can read member qualifications" on public.member_qualifications
  for select to authenticated using (true);
create policy "Member managers can change member qualifications" on public.member_qualifications
  for all to authenticated
  using (public.has_permission('manage_members'))
  with check (public.has_permission('manage_members'));
