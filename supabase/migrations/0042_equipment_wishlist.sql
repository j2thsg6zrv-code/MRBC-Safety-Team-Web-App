-- Equipment wishlist (Matt, 2026-11-01): things the team needs or would like
-- to have, entered like equipment (quantity + description) with an optional
-- note on why it's needed. Any approved team member can add a request and
-- remove their own; people whose role has "Manage equipment" (and admins) can
-- edit or remove any request and move it into the inventory once it's bought.

create table if not exists public.equipment_wishlist (
  id uuid primary key default gen_random_uuid(),
  description text not null check (length(description) between 1 and 500),
  quantity integer not null default 1 check (quantity between 1 and 100000),
  notes text check (notes is null or length(notes) <= 2000),
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists equipment_wishlist_created_idx on public.equipment_wishlist (created_at desc);

alter table public.equipment_wishlist enable row level security;

drop policy if exists "Team members can see the wishlist" on public.equipment_wishlist;
create policy "Team members can see the wishlist" on public.equipment_wishlist
  for select to authenticated
  using (public.is_active_member());

drop policy if exists "Team members can add to the wishlist" on public.equipment_wishlist;
create policy "Team members can add to the wishlist" on public.equipment_wishlist
  for insert to authenticated
  with check (public.is_active_member() and created_by = auth.uid());

drop policy if exists "Equipment managers can edit the wishlist" on public.equipment_wishlist;
create policy "Equipment managers can edit the wishlist" on public.equipment_wishlist
  for update to authenticated
  using (public.has_permission('manage_equipment'))
  with check (public.has_permission('manage_equipment'));

drop policy if exists "Members remove their own wishlist requests" on public.equipment_wishlist;
create policy "Members remove their own wishlist requests" on public.equipment_wishlist
  for delete to authenticated
  using (public.has_permission('manage_equipment') or (created_by = auth.uid() and public.is_active_member()));
