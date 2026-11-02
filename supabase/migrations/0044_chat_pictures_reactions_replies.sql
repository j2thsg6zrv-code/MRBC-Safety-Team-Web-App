-- Team chat pictures, reactions and replies (Matt, 2026-11-01).
--
-- 1. Pictures and GIFs: a message can carry one picture, kept in the private
--    'chat' bucket. Team pictures live under team/<sender>/, one-on-one
--    pictures under direct/<sender>/<recipient>/, so only the people in the
--    conversation can open them.
-- 2. Reactions: members tap an emoji on any message they can see.
-- 3. Replies: a message can point at the earlier message it answers.

-- 1. Pictures ----------------------------------------------------------------

alter table public.chat_messages add column if not exists image_path text;
alter table public.chat_messages add column if not exists reply_to uuid
  references public.chat_messages (id) on delete set null;

-- A picture can be sent without any words.
alter table public.chat_messages drop constraint if exists chat_messages_body_check;
alter table public.chat_messages drop constraint if exists chat_messages_body_or_picture;
alter table public.chat_messages add constraint chat_messages_body_or_picture
  check (length(btrim(body)) <= 4000 and (length(btrim(body)) >= 1 or image_path is not null));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat', 'chat', false, 10485760, array['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members see chat pictures in their conversations" on storage.objects;
create policy "Members see chat pictures in their conversations" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'chat' and public.is_active_member()
    and ((storage.foldername(name))[1] = 'team'
         or ((storage.foldername(name))[1] = 'direct'
             and auth.uid()::text in ((storage.foldername(name))[2], (storage.foldername(name))[3])))
  );

drop policy if exists "Members add their own chat pictures" on storage.objects;
create policy "Members add their own chat pictures" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat' and public.is_active_member()
    and (storage.foldername(name))[1] in ('team', 'direct')
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Members remove their own chat pictures" on storage.objects;
create policy "Members remove their own chat pictures" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'chat' and public.is_active_member()
    and ((storage.foldername(name))[2] = auth.uid()::text
         or ((storage.foldername(name))[1] = 'team' and public.is_admin()))
  );

-- Sending: the picture must be one of yours in this conversation's folder, and
-- a reply must answer a message in the same conversation.
drop policy if exists "Members send messages as themselves" on public.chat_messages;
create policy "Members send messages as themselves" on public.chat_messages
  for insert to authenticated
  with check (
    public.is_active_member()
    and sender_id = auth.uid()
    and (recipient_id is null or exists (select 1 from public.profiles p where p.id = recipient_id and p.active))
    and (image_path is null
         or image_path like case when recipient_id is null then 'team/' || auth.uid() || '/%'
                                 else 'direct/' || auth.uid() || '/' || recipient_id || '/%' end)
    and (reply_to is null or exists (
          select 1 from public.chat_messages r
           where r.id = chat_messages.reply_to
             and case when chat_messages.recipient_id is null then r.recipient_id is null
                      else (r.sender_id = chat_messages.sender_id and r.recipient_id = chat_messages.recipient_id)
                        or (r.sender_id = chat_messages.recipient_id and r.recipient_id = chat_messages.sender_id) end))
  );

-- Emails for a picture with no words say so instead of showing empty quotes.
create or replace function public.email_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  site text := (select site_url from public.notification_settings);
  sender_name text;
  member public.profiles;
  conv text;
  read_at timestamptz;
  preview text := left(regexp_replace(btrim(new.body), '\s+', ' ', 'g'), 300);
begin
  select coalesce(nullif(btrim(full_name), ''), email) into sender_name from public.profiles where id = new.sender_id;
  if length(btrim(new.body)) > 300 then preview := preview || '...'; end if;
  if new.image_path is not null then
    preview := case when preview = '' then '(a picture)' else preview || ' (with a picture)' end;
  end if;

  for member in
    select p.* from public.profiles p
     where p.active and p.notify_by <> 'none' and p.id <> new.sender_id
       and case when new.recipient_id is null then p.notify_chat_team
                else p.id = new.recipient_id and p.notify_chat_direct end
  loop
    conv := case when new.recipient_id is null then 'team' else new.sender_id::text end;
    select r.last_read_at into read_at from public.chat_reads r
     where r.profile_id = member.id and r.conversation = conv;
    continue when read_at > now() - interval '5 minutes';

    perform public.queue_message(
      'chat', 'email', member.email,
      case when new.recipient_id is null then format('%s posted in the team chat', sender_name)
           else format('New message from %s', sender_name) end,
      format('Hi %s! %s %s:' || E'\n\n"%s"\n\n' || 'Read and reply: %s/chat/%s'
             || E'\n\n' || 'You won''t get another email about this conversation until you''ve read it. You can turn these emails off on My Profile. - MRBC Safety Team',
             public.first_name(member.full_name), sender_name,
             case when new.recipient_id is null then 'wrote in the team chat' else 'sent you a message' end,
             preview, site, case when new.recipient_id is null then 'team' else new.sender_id::text end),
      format('chat:%s:%s:%s', conv, member.id, coalesce(extract(epoch from read_at)::bigint::text, '0'))
    );
  end loop;
  return new;
end;
$$;
revoke all on function public.email_chat_message() from public, anon, authenticated;

-- 2. Reactions ---------------------------------------------------------------

create table if not exists public.chat_reactions (
  message_id uuid not null references public.chat_messages (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id, emoji)
);
alter table public.chat_reactions enable row level security;

-- Seen by anyone who can see the message (the message's own rules decide).
drop policy if exists "Members see reactions on messages they can see" on public.chat_reactions;
create policy "Members see reactions on messages they can see" on public.chat_reactions
  for select to authenticated
  using (public.is_active_member() and exists (select 1 from public.chat_messages m where m.id = message_id));

drop policy if exists "Members react as themselves" on public.chat_reactions;
create policy "Members react as themselves" on public.chat_reactions
  for insert to authenticated
  with check (
    public.is_active_member() and profile_id = auth.uid()
    and exists (select 1 from public.chat_messages m where m.id = message_id)
  );

drop policy if exists "Members take back their own reactions" on public.chat_reactions;
create policy "Members take back their own reactions" on public.chat_reactions
  for delete to authenticated
  using (profile_id = auth.uid());

-- Live updates for reactions too.
do $$
begin
  alter publication supabase_realtime add table public.chat_reactions;
exception when duplicate_object then null;
end;
$$;
