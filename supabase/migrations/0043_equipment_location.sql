-- Equipment location (Matt, 2026-11-01): where each item is kept, shown as a
-- column in the inventory table.
alter table public.equipment_items add column if not exists location text
  check (location is null or length(location) <= 200);
