-- Admins get an email when someone creates an account (Matt, 2026-10-25):
-- invited people are ready to go; others are waiting for approval.

create or replace function public.alert_admins_new_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin public.profiles;
  who text := coalesce(nullif(btrim(new.full_name), ''), new.email);
  site text := (select site_url from public.notification_settings);
begin
  for admin in
    select p.* from public.profiles p
      join public.roles r on r.id = p.role_id
     where r.is_admin and p.active and p.id <> new.id and p.notify_by <> 'none'
  loop
    perform public.queue_message(
      'new_member', 'email', admin.email,
      case when new.active then format('%s joined the safety team app', who)
           else format('%s is waiting for approval', who) end,
      case when new.active
        then format('Hi %s! %s (%s) accepted their invite and finished setting up their account. They can now see the schedule and sign up for positions.'
                    || E'\n\nSee the team: %s/members - MRBC Safety Team',
                    public.first_name(admin.full_name), who, new.email, site)
        else format('Hi %s! %s (%s) created an account and is waiting for approval.'
                    || E'\n\nApprove them on the Members page: %s/members - MRBC Safety Team',
                    public.first_name(admin.full_name), who, new.email, site)
      end,
      format('new_member:%s:%s', new.id, admin.id)
    );
  end loop;
  return new;
end;
$$;

revoke all on function public.alert_admins_new_member() from public, anon, authenticated;

create trigger alert_admins_new_member
  after insert on public.profiles
  for each row execute function public.alert_admins_new_member();
