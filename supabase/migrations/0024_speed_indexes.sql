-- Indexes on the links between tables so pages that join them stay quick as
-- the schedule, reports and training grow (Supabase performance advisor,
-- 2026-10-29). Safe to run more than once.

create index if not exists event_positions_position_id_idx on public.event_positions (position_id);
create index if not exists events_building_id_idx on public.events (building_id);
create index if not exists events_created_by_idx on public.events (created_by);
create index if not exists incident_reports_building_id_idx on public.incident_reports (building_id);
create index if not exists incident_reports_event_id_idx on public.incident_reports (event_id);
create index if not exists incident_reports_reported_by_idx on public.incident_reports (reported_by);
create index if not exists incident_reports_watch_list_id_idx on public.incident_reports (watch_list_id);
create index if not exists member_invites_invited_by_idx on public.member_invites (invited_by);
create index if not exists member_qualifications_qualification_id_idx on public.member_qualifications (qualification_id);
create index if not exists positions_building_id_idx on public.positions (building_id);
create index if not exists positions_required_qualification_id_idx on public.positions (required_qualification_id);
create index if not exists profiles_role_id_idx on public.profiles (role_id);
create index if not exists training_attempts_class_id_idx on public.training_attempts (class_id);
create index if not exists training_classes_approved_by_idx on public.training_classes (approved_by);
create index if not exists training_classes_created_by_idx on public.training_classes (created_by);
create index if not exists training_classes_prerequisite_id_idx on public.training_classes (prerequisite_id);
create index if not exists training_classes_qualification_id_idx on public.training_classes (qualification_id);
create index if not exists training_progress_class_id_idx on public.training_progress (class_id);
create index if not exists watch_list_added_by_idx on public.watch_list (added_by);
