-- Watch List notes (Matt, 2026-10-30): everyone who can see the Watch List can
-- add notes to an entry, to record sightings, events and other important
-- information over time. Notes show below the photo and details, stamped with
-- the date and time they were added. Only the writer or an admin can edit or
-- delete a note.

create table public.watch_list_notes (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.watch_list (id) on delete cascade,
  body text not null check (length(body) between 1 and 5000),
  created_by uuid default auth.uid()
    constraint watch_list_notes_created_by_fkey references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid
    constraint watch_list_notes_updated_by_fkey references public.profiles (id) on delete set null,
  updated_at timestamptz
);

create index watch_list_notes_entry_idx on public.watch_list_notes (entry_id, created_at);

alter table public.watch_list_notes enable row level security;

create policy "Watch list viewers can read notes" on public.watch_list_notes
  for select to authenticated
  using (public.has_permission('view_watch_list') or public.has_permission('manage_watch_list'));
create policy "Watch list viewers can add notes" on public.watch_list_notes
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and (public.has_permission('view_watch_list') or public.has_permission('manage_watch_list'))
  );
-- Only the person who wrote a note, or an admin, can change or delete it.
create policy "Writers and admins can edit notes" on public.watch_list_notes
  for update to authenticated
  using (
    (created_by = auth.uid() and (public.has_permission('view_watch_list') or public.has_permission('manage_watch_list')))
    or public.is_admin()
  )
  with check (updated_by = auth.uid());
create policy "Writers and admins can delete notes" on public.watch_list_notes
  for delete to authenticated
  using (
    (created_by = auth.uid() and (public.has_permission('view_watch_list') or public.has_permission('manage_watch_list')))
    or public.is_admin()
  );

-- The time stamps are set here, not by the app: a note is stamped when it's
-- added and again when edited, and can't be moved to another entry or have
-- its writer changed.
create or replace function public.watch_list_notes_stamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_by := null;
    new.updated_at := null;
  else
    new.entry_id := old.entry_id;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create trigger watch_list_notes_stamp
  before insert or update on public.watch_list_notes
  for each row execute function public.watch_list_notes_stamp();
