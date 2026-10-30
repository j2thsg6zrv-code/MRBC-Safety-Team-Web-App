-- Bugs & Requests (Matt, 2026-10-30): any team member can report something in
-- the app that doesn't work right, or suggest an improvement. Everyone on the
-- team can see the list (so the same thing isn't reported twice and people can
-- see what's being worked on); only admins change the status or add a reply.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('bug', 'idea')),
  title text not null check (length(title) between 3 and 150),
  details text check (length(details) <= 5000),
  -- Which page or part of the app it's about, in the member's words.
  page text check (length(page) <= 150),
  status text not null default 'new'
    check (status in ('new', 'planned', 'in_progress', 'done', 'wont_fix')),
  -- An admin's reply to the person who sent it.
  admin_note text check (length(admin_note) <= 2000),
  submitted_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index feedback_created_idx on public.feedback (created_at desc);
create index feedback_open_idx on public.feedback (status) where status in ('new', 'planned', 'in_progress');

alter table public.feedback enable row level security;

create policy "Team members can send feedback" on public.feedback
  for insert to authenticated
  with check (submitted_by = auth.uid() and status = 'new' and admin_note is null and public.is_active_member());
create policy "Team members can read feedback" on public.feedback
  for select to authenticated
  using (public.is_active_member());
create policy "Admins can update feedback" on public.feedback
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
-- Members can take back something they sent until an admin has looked at it.
create policy "Senders can delete new feedback; admins can delete any" on public.feedback
  for delete to authenticated
  using ((submitted_by = auth.uid() and status = 'new') or public.is_admin());
