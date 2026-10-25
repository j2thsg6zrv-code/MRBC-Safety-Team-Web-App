-- Invite people to the safety team by email (Matt, 2026-10-25). Each invite
-- emails them the sign-up link. When they sign up with that same address
-- they're approved automatically, since a member manager already chose them.

create table public.member_invites (
  email text primary key check (email = lower(email) and email like '%_@_%'),
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

alter table public.member_invites enable row level security;
create policy "Member managers can see invites" on public.member_invites
  for select to authenticated using (public.has_permission('manage_members'));
create policy "Member managers can cancel invites" on public.member_invites
  for delete to authenticated using (public.has_permission('manage_members'));

-- Invites each address and emails it the sign-up link. Returns what happened
-- to each one.
create or replace function public.invite_members(p_emails text[])
returns table (email text, result text)
language plpgsql
security definer
set search_path = public
as $$
declare
  raw text;
  address text;
  inviter text;
  site text := (select site_url from public.notification_settings);
begin
  if not public.has_permission('manage_members') then
    raise exception 'Only members who can manage members can send invites.';
  end if;
  select coalesce(nullif(full_name, ''), 'A safety team leader') into inviter from public.profiles where id = auth.uid();

  foreach raw in array p_emails loop
    address := lower(btrim(raw));
    continue when address = '';
    email := address;
    if address !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
      result := 'not a valid email address';
    elsif exists (select 1 from public.profiles p where lower(p.email) = address) then
      result := 'already has an account';
    else
      insert into public.member_invites (email, invited_by) values (address, auth.uid())
      on conflict on constraint member_invites_pkey do update set invited_by = excluded.invited_by, created_at = now();
      perform public.queue_message(
        'invite', 'email', address, 'You''re invited to the MRBC Safety Team app',
        format('Hi! %s has invited you to join the MRBC Safety Team app, where the team signs up for positions, sees the schedule and files reports.'
               || E'\n\nCreate your account here: %s/signup?email=%s'
               || E'\n\nSign up with this email address (%s) and your account will be ready to use right away.'
               || E'\n\n- MRBC Safety Team',
               inviter, site, replace(replace(address, '+', '%2B'), '@', '%40'), address),
        'invite:' || address || ':' || gen_random_uuid()
      );
      result := 'invited';
    end if;
    return next;
  end loop;
end;
$$;

revoke all on function public.invite_members(text[]) from public, anon;
grant execute on function public.invite_members(text[]) to authenticated;

-- New sign-ups who were invited are approved automatically.
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
    is_first or was_invited  -- the first person (the admin) and invited people are approved automatically
  );
  update public.member_invites set accepted_at = now() where email = lower(new.email);
  return new;
end;
$$;
