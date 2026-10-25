-- The Admin role is special: its members can do everything, only they can
-- manage roles or make someone an admin, and there is always at least one.

alter table public.roles add column is_admin boolean not null default false;
update public.roles set is_admin = true where name = 'Admin';

-- "Manage roles" is now part of being an admin rather than a permission.
update public.roles set permissions = array_remove(permissions, 'manage_roles');

create or replace function public.is_admin()
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
    where p.id = auth.uid() and p.active and r.is_admin
  );
$$;

-- Admins have every permission, whatever boxes are ticked on their role.
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
      and (r.is_admin or perm = any (r.permissions))
  );
$$;

alter policy "Role managers can change roles" on public.roles
  using (public.is_admin())
  with check (public.is_admin());
alter policy "Role managers can change roles" on public.roles rename to "Admins can change roles";

-- The Admin role can't be deleted or stop being the admin role, and no other
-- role can become one.
create or replace function public.protect_admin_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.is_admin then
      raise exception 'The Admin role can''t be deleted.';
    end if;
    return old;
  end if;
  if new.is_admin is distinct from old.is_admin and auth.uid() is not null then
    raise exception 'Only the Admin role can be the admin role.';
  end if;
  return new;
end;
$$;

create trigger protect_admin_role
  before update or delete on public.roles
  for each row execute function public.protect_admin_role();

-- Profile rules: members can't change their own role or status; only admins
-- can give or take away the Admin role (or deactivate an admin); and the last
-- active admin can't be removed. auth.uid() is null for the Supabase SQL editor.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  was_admin boolean;
  is_now_admin boolean;
begin
  select coalesce(r.is_admin, false) into was_admin from public.roles r where r.id = old.role_id;
  was_admin := coalesce(was_admin, false) and old.active;

  if tg_op = 'DELETE' then
    is_now_admin := false;
  else
    select coalesce(r.is_admin, false) into is_now_admin from public.roles r where r.id = new.role_id;
    is_now_admin := coalesce(is_now_admin, false) and new.active;

    if auth.uid() is not null
       and (new.role_id is distinct from old.role_id or new.active is distinct from old.active) then
      if not public.has_permission('manage_members') then
        raise exception 'Only members with the manage_members permission can change roles or active status';
      end if;
      if was_admin is distinct from is_now_admin and not public.is_admin() then
        raise exception 'Only an admin can make someone an admin or remove an admin.';
      end if;
    end if;
  end if;

  if was_admin and not is_now_admin and not exists (
    select 1 from public.profiles p join public.roles r on r.id = p.role_id
    where r.is_admin and p.active and p.id <> old.id
  ) then
    raise exception 'There must always be at least one admin. Make someone else an admin first.';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace trigger protect_profile_fields
  before update or delete on public.profiles
  for each row execute function public.protect_profile_fields();

-- New sign-ups (including through the invite QR code) get the default role,
-- Team Member unless an admin picks another; they still wait for approval.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean := not exists (select 1 from public.profiles);
  assigned_role uuid;
begin
  if is_first then
    select id into assigned_role from public.roles where is_admin limit 1;
  else
    select id into assigned_role from public.roles where is_default and not is_admin limit 1;
    if assigned_role is null then
      select id into assigned_role from public.roles where name = 'Team Member';
    end if;
  end if;

  insert into public.profiles (id, email, full_name, role_id, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    assigned_role,
    is_first  -- the first person (the admin) is approved automatically
  );
  return new;
end;
$$;
