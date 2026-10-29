-- Slide pictures (Matt, 2026-10-29): each lesson can show a picture, either
-- uploaded by an admin or created by the app's AI image service.

alter table public.training_lessons add column image_path text;

-- Pictures live in a private bucket; the app shows them through short-lived links.
insert into storage.buckets (id, name, public)
values ('training', 'training', false)
on conflict (id) do nothing;

create policy "Members can see training pictures" on storage.objects
  for select to authenticated
  using (bucket_id = 'training' and (public.is_active_member() or public.is_admin()));
create policy "Admins can add training pictures" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'training' and public.is_admin());
create policy "Admins can remove training pictures" on storage.objects
  for delete to authenticated
  using (bucket_id = 'training' and public.is_admin());
