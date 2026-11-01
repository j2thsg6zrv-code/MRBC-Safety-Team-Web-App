-- Equipment inventory (Matt, 2026-11-01): a list of the team's equipment with
-- quantity, description, expiration date and the date it was last checked.
-- Every approved team member can see the list; people whose role has
-- "Manage equipment" (and admins) can add, edit or remove items.

create table if not exists public.equipment_items (
  id uuid primary key default gen_random_uuid(),
  description text not null check (length(description) between 1 and 500),
  quantity integer not null default 1 check (quantity between 0 and 100000),
  expiration_date date,
  date_checked date,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists equipment_items_description_idx on public.equipment_items (lower(description));

alter table public.equipment_items enable row level security;

drop policy if exists "Team members can see equipment" on public.equipment_items;
create policy "Team members can see equipment" on public.equipment_items
  for select to authenticated
  using (public.is_active_member());

drop policy if exists "Equipment managers can add equipment" on public.equipment_items;
create policy "Equipment managers can add equipment" on public.equipment_items
  for insert to authenticated
  with check (public.has_permission('manage_equipment'));

drop policy if exists "Equipment managers can edit equipment" on public.equipment_items;
create policy "Equipment managers can edit equipment" on public.equipment_items
  for update to authenticated
  using (public.has_permission('manage_equipment'))
  with check (public.has_permission('manage_equipment'));

drop policy if exists "Equipment managers can remove equipment" on public.equipment_items;
create policy "Equipment managers can remove equipment" on public.equipment_items
  for delete to authenticated
  using (public.has_permission('manage_equipment'));
