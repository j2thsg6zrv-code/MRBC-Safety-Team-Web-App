-- Incident report rules (Matt, 2026-11-01):
--   * Any approved team member can file a report (unchanged).
--   * Only the person who filed a report and admins can edit it.
--   * Only admins can delete a report.
--   * The person who filed a report can ask the admins to delete it. The
--     admins get an email and can delete it or decline the request.
-- Closing a report and writing follow-up notes are admin-only too, so the
-- "Manage incident reports" role permission is retired. Roles with
-- "View all incident reports" still see every report.
-- Safe to run twice.

-- Deletion requests -----------------------------------------------------------

alter table public.incident_reports
  add column if not exists delete_requested_at timestamptz,
  add column if not exists delete_requested_by uuid references public.profiles (id) on delete set null,
  add column if not exists delete_request_reason text check (length(delete_request_reason) <= 1000);

-- Who can edit and delete -----------------------------------------------------

drop policy if exists "Reporters can edit their open reports" on public.incident_reports;
drop policy if exists "Incident managers can edit any report" on public.incident_reports;
drop policy if exists "Incident managers can delete reports" on public.incident_reports;
drop policy if exists "Reporters and admins can edit reports" on public.incident_reports;
drop policy if exists "Admins can delete reports" on public.incident_reports;

create policy "Reporters and admins can edit reports" on public.incident_reports
  for update to authenticated
  using ((reported_by = auth.uid() and public.is_active_member()) or public.is_admin())
  with check ((reported_by = auth.uid() and public.is_active_member()) or public.is_admin());

create policy "Admins can delete reports" on public.incident_reports
  for delete to authenticated
  using (public.is_admin());

-- The person who filed a report edits what happened; only admins close it or
-- write follow-up notes. Nobody changes who filed it or when. The deletion
-- request fields only change through the functions below.
create or replace function public.incident_reports_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.reported_by := old.reported_by;
  new.created_at := old.created_at;
  if not public.is_admin() then
    new.status := old.status;
    new.follow_up_notes := old.follow_up_notes;
  end if;
  if coalesce(current_setting('mrbc.incident_delete_request', true), '') <> 'yes' then
    new.delete_requested_at := old.delete_requested_at;
    new.delete_requested_by := old.delete_requested_by;
    new.delete_request_reason := old.delete_request_reason;
  end if;
  return new;
end;
$$;

drop trigger if exists incident_reports_guard on public.incident_reports;
create trigger incident_reports_guard
  before update on public.incident_reports
  for each row execute function public.incident_reports_guard();

-- The person who filed a report asks the admins to delete it.
create or replace function public.request_incident_deletion(p_report uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  report public.incident_reports;
  requester public.profiles;
  admin_email text;
  site text := (select site_url from public.notification_settings);
  clean_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  select * into report from public.incident_reports where id = p_report;
  if report.id is null or report.reported_by is distinct from auth.uid() or not public.is_active_member() then
    raise exception 'Only the person who filed this report can ask for it to be deleted.';
  end if;
  if clean_reason is not null and length(clean_reason) > 1000 then
    raise exception 'Please keep the reason under 1000 characters.';
  end if;
  if report.delete_requested_at is not null then
    return; -- already asked
  end if;

  perform set_config('mrbc.incident_delete_request', 'yes', true);
  update public.incident_reports
     set delete_requested_at = now(), delete_requested_by = auth.uid(), delete_request_reason = clean_reason
   where id = p_report;
  perform set_config('mrbc.incident_delete_request', '', true);

  select * into requester from public.profiles where id = auth.uid();
  for admin_email in
    select p.email from public.profiles p join public.roles r on r.id = p.role_id
     where p.active and r.is_admin and nullif(btrim(p.email), '') is not null
  loop
    perform public.queue_message(
      'incident_delete_request', 'email', admin_email,
      format('%s asked to delete an incident report', coalesce(nullif(requester.full_name, ''), requester.email)),
      format(E'%s asked an admin to delete their incident report "%s" from %s.',
             coalesce(nullif(requester.full_name, ''), requester.email), report.category,
             to_char(report.incident_date, 'FMMonth FMDD, YYYY'))
        || coalesce(E'\n\nReason: ' || clean_reason, '')
        || format(E'\n\nOpen the report to delete it or decline the request:\n%s/incidents/%s\n\n- MRBC Safety Team', site, report.id),
      format('incident_delete_request:%s:%s:%s', report.id, extract(epoch from now())::bigint, admin_email)
    );
  end loop;
end;
$$;

-- The person who asked takes it back, or an admin declines it.
create or replace function public.cancel_incident_deletion(p_report uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and not exists (
    select 1 from public.incident_reports
     where id = p_report and reported_by = auth.uid() and public.is_active_member()
  ) then
    raise exception 'You can''t change this deletion request.';
  end if;
  perform set_config('mrbc.incident_delete_request', 'yes', true);
  update public.incident_reports
     set delete_requested_at = null, delete_requested_by = null, delete_request_reason = null
   where id = p_report;
  perform set_config('mrbc.incident_delete_request', '', true);
end;
$$;

revoke all on function public.request_incident_deletion(uuid, text) from public, anon;
revoke all on function public.cancel_incident_deletion(uuid) from public, anon;
grant execute on function public.request_incident_deletion(uuid, text) to authenticated;
grant execute on function public.cancel_incident_deletion(uuid) to authenticated;

-- Retire "Manage incident reports": closing and follow-up are admin-only now.
update public.roles set permissions = array_remove(permissions, 'manage_incidents')
 where 'manage_incidents' = any (permissions);
