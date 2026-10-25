-- Team chat (Matt, 2026-10-25): one conversation for the whole team, plus
-- one-on-one messages between any two members. Only active members can read
-- or write. New messages show up live through Supabase Realtime, and members
-- can choose on My Profile to get an email when a message is waiting.

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  -- Null means the whole-team chat; otherwise a one-on-one message.
  recipient_id uuid references public.profiles (id) on delete cascade,
  body text not null check (length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  check (recipient_id is null or recipient_id <> sender_id)
);
create index chat_messages_team_idx on public.chat_messages (created_at) where recipient_id is null;
create index chat_messages_sender_idx on public.chat_messages (sender_id, recipient_id, created_at);
create index chat_messages_recipient_idx on public.chat_messages (recipient_id, sender_id, created_at);

alter table public.chat_messages enable row level security;

create policy "Members read the team chat and their own messages" on public.chat_messages
  for select to authenticated
  using (
    public.is_active_member()
    and (recipient_id is null or sender_id = auth.uid() or recipient_id = auth.uid())
  );

create policy "Members send messages as themselves" on public.chat_messages
  for insert to authenticated
  with check (
    public.is_active_member()
    and sender_id = auth.uid()
    and (recipient_id is null or exists (select 1 from public.profiles p where p.id = recipient_id and p.active))
  );

-- People can take back their own messages; admins can remove team-chat posts.
create policy "Members delete their own messages" on public.chat_messages
  for delete to authenticated
  using (
    public.is_active_member()
    and (sender_id = auth.uid() or (recipient_id is null and public.is_admin()))
  );

-- When each member last read each conversation ('team' or the other person's id).
create table public.chat_reads (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  conversation text not null,
  last_read_at timestamptz not null default now(),
  primary key (profile_id, conversation)
);
alter table public.chat_reads enable row level security;
create policy "Members keep their own read marks" on public.chat_reads
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and public.is_active_member());

-- Live updates.
alter publication supabase_realtime add table public.chat_messages;

-- The latest message and unread count for each conversation the member is in.
-- Runs as the member, so row level security decides what they see.
create or replace function public.chat_overview()
returns table (conversation text, last_at timestamptz, last_body text, last_sender uuid, unread integer)
language sql
stable
set search_path = public
as $$
  with mine as (
    select m.*,
           case when m.recipient_id is null then 'team'
                when m.sender_id = auth.uid() then m.recipient_id::text
                else m.sender_id::text end as conv
      from public.chat_messages m
  ),
  since as (
    -- Before someone first opens a conversation, count from when they joined.
    select c.conv,
           coalesce((select r.last_read_at from public.chat_reads r
                      where r.profile_id = auth.uid() and r.conversation = c.conv),
                    (select p.created_at from public.profiles p where p.id = auth.uid())) as read_at
      from (select distinct conv from mine) c
  )
  select l.conv, l.created_at, l.body, l.sender_id,
         (select count(*)::int from mine x
           where x.conv = l.conv and x.sender_id <> auth.uid() and x.created_at > s.read_at)
    from (select distinct on (conv) conv, created_at, body, sender_id
            from mine order by conv, created_at desc) l
    join since s on s.conv = l.conv;
$$;

revoke all on function public.chat_overview() from public, anon;
grant execute on function public.chat_overview() to authenticated;

-- Emails ----------------------------------------------------------------------

alter table public.profiles
  add column notify_chat_direct boolean not null default true,
  add column notify_chat_team boolean not null default false;

-- One email per conversation until the member reads it, and none while
-- they've had the conversation open in the last few minutes.
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

create trigger email_chat_message
  after insert on public.chat_messages
  for each row execute function public.email_chat_message();
