-- Sign-up is by invitation only (Matt, 2026-10-29). Only an email address
-- that has been sent an invite (Safety Team Members → Invite by email) can
-- create an account; anyone else is refused. The very first account (the
-- admin) is still allowed so a fresh setup can get started.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean := not exists (select 1 from public.profiles);
  was_invited boolean := exists (select 1 from public.member_invites where email = lower(new.email));
  assigned_role uuid;
begin
  if not is_first and not was_invited then
    raise exception 'Sign-up is by invitation only. % has not been invited.', new.email;
  end if;

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
    true  -- only the first person (the admin) and invited people get this far
  );
  update public.member_invites set accepted_at = now() where email = lower(new.email);
  return new;
end;
$$;
