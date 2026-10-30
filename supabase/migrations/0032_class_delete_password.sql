-- Deleting a training class (Matt, 2026-10-30): admins can delete a class from
-- Training > Manage classes, but only after typing the class delete password.
-- The password is checked here in the database against a bcrypt hash, so it
-- never reaches browser code. The hash isn't in this file: it's set once in
-- the live database (see the end of this file).
--
-- Deleting a class also deletes its slides, quiz, everyone's progress and its
-- pass history (those tables cascade). Certifications and qualifications
-- members already earned stay on their records.

create table public.app_secrets (
  name text primary key,
  hash text not null,
  updated_at timestamptz not null default now()
);

-- Nobody reads this table through the API; only the function below uses it.
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

-- Deletes a class when the caller is an admin and the password matches.
-- Returns the storage paths of the class's slide pictures so the app can
-- remove those files too.
create or replace function public.delete_training_class(p_class uuid, p_password text)
returns text[]
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored text;
  pictures text[];
begin
  if not public.is_admin() then
    raise exception 'Only admins can delete classes.';
  end if;
  select hash into stored from public.app_secrets where name = 'class_delete_password';
  if stored is null then
    raise exception 'The class delete password hasn''t been set up yet.';
  end if;
  if p_password is null or crypt(p_password, stored) <> stored then
    raise exception 'That password isn''t right.';
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

revoke all on function public.delete_training_class(uuid, text) from public, anon;
grant execute on function public.delete_training_class(uuid, text) to authenticated;

-- To set or change the password, run this in the Supabase SQL Editor with the
-- new password in place of NEW-PASSWORD:
--   insert into public.app_secrets (name, hash)
--   values ('class_delete_password', extensions.crypt('NEW-PASSWORD', extensions.gen_salt('bf')))
--   on conflict (name) do update set hash = excluded.hash, updated_at = now();
