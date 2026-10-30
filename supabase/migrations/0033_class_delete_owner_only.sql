-- Deleting a training class, take two (Matt, 2026-10-30): instead of a
-- password, only Matt can delete classes. The people allowed are listed in
-- class_deleters, which can only be changed in the Supabase SQL Editor. Matt
-- was the only admin when this ran, so the first admin is added here.
--
-- Deleting a class also deletes its slides, quiz, everyone's progress and its
-- pass history (those tables cascade). Certifications and qualifications
-- members already earned stay on their records.

drop function if exists public.delete_training_class(uuid, text);
drop table if exists public.app_secrets;

create table public.class_deleters (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Each person can see whether they're on the list (to show the Delete
-- button); nobody can change it through the app.
alter table public.class_deleters enable row level security;
create policy "Members can see their own class delete access" on public.class_deleters
  for select to authenticated using (profile_id = auth.uid());

insert into public.class_deleters (profile_id)
select p.id from public.profiles p join public.roles r on r.id = p.role_id
 where r.is_admin and p.active
 order by p.created_at
 limit 1
on conflict do nothing;

-- Deletes a class when the caller is an active admin on class_deleters.
-- Returns the storage paths of the class's slide pictures so the app can
-- remove those files too.
create or replace function public.delete_training_class(p_class uuid)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  pictures text[];
begin
  if not public.is_admin()
     or not exists (select 1 from public.class_deleters where profile_id = auth.uid()) then
    raise exception 'You don''t have permission to delete classes.';
  end if;

  select coalesce(array_agg(image_path) filter (where image_path is not null), '{}')
    into pictures
    from public.training_lessons where class_id = p_class;
  delete from public.training_classes where id = p_class;
  if not found then
    raise exception 'That class was already deleted.';
  end if;
  -- Keep any picture another class still uses.
  return array(
    select distinct p from unnest(pictures) p
     where not exists (select 1 from public.training_lessons l where l.image_path = p)
  );
end;
$$;

revoke all on function public.delete_training_class(uuid) from public, anon;
grant execute on function public.delete_training_class(uuid) to authenticated;

-- To let someone else delete classes too, run this in the SQL Editor with
-- their email:
--   insert into public.class_deleters (profile_id)
--   select id from public.profiles where email = 'their@email';
