-- Training (Matt, 2026-10-29): admins build classes on church safety topics;
-- active members read the lessons and take a short quiz. A new class stays a
-- draft that only admins can see until an admin approves it for use. Passing
-- a class adds its certification to the member's qualifications and emails
-- the admins.

create table public.training_classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  minutes integer check (minutes is null or minutes > 0),
  -- The qualification a member earns by passing.
  qualification_id uuid references public.qualifications (id) on delete set null,
  -- A class that has to be passed first.
  prerequisite_id uuid references public.training_classes (id) on delete set null,
  pass_percent integer not null default 80 check (pass_percent between 1 and 100),
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'approved')),
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  check (prerequisite_id is distinct from id)
);

create table public.training_lessons (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.training_classes (id) on delete cascade,
  position integer not null default 0,
  title text not null,
  -- Plain text. Lines starting with "- " show as bullet points, **bold** works.
  body text not null default '',
  video_url text,
  created_at timestamptz not null default now()
);
create index training_lessons_class_idx on public.training_lessons (class_id, position);

create table public.training_questions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.training_classes (id) on delete cascade,
  position integer not null default 0,
  prompt text not null,
  choices text[] not null check (cardinality(choices) between 2 and 6),
  created_at timestamptz not null default now()
);
create index training_questions_class_idx on public.training_questions (class_id, position);

-- Kept apart from the questions so members taking the quiz can't read them.
create table public.training_answers (
  question_id uuid primary key references public.training_questions (id) on delete cascade,
  -- 0 is the first choice.
  correct_index integer not null check (correct_index >= 0)
);

create table public.training_attempts (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.training_classes (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  correct integer not null,
  total integer not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);
create index training_attempts_profile_idx on public.training_attempts (profile_id, class_id);

-- Approving records who approved it and when; going back to draft clears it.
create or replace function public.stamp_class_approval()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'approved' and (tg_op = 'INSERT' or old.status <> 'approved') then
    new.approved_by := auth.uid();
    new.approved_at := now();
  elsif new.status = 'draft' then
    new.approved_by := null;
    new.approved_at := null;
  end if;
  return new;
end;
$$;

create trigger stamp_class_approval
  before insert or update of status on public.training_classes
  for each row execute function public.stamp_class_approval();

-- Members see approved classes; admins see everything and make the changes.
create or replace function public.can_see_class(p_class uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or (
    public.is_active_member()
    and exists (select 1 from public.training_classes c where c.id = p_class and c.status = 'approved')
  );
$$;

alter table public.training_classes enable row level security;
alter table public.training_lessons enable row level security;
alter table public.training_questions enable row level security;
alter table public.training_answers enable row level security;
alter table public.training_attempts enable row level security;

create policy "Members see approved classes" on public.training_classes
  for select to authenticated using (public.can_see_class(id));
create policy "Admins manage classes" on public.training_classes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Members see lessons of approved classes" on public.training_lessons
  for select to authenticated using (public.can_see_class(class_id));
create policy "Admins manage lessons" on public.training_lessons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Members see questions of approved classes" on public.training_questions
  for select to authenticated using (public.can_see_class(class_id));
create policy "Admins manage questions" on public.training_questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage answers" on public.training_answers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Attempts are only written by submit_training_quiz below.
create policy "Members see their own attempts" on public.training_attempts
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());

-- Grades a quiz. p_answers holds the chosen choice (0 = first) for each
-- question in position order. Passing adds or renews the class's
-- qualification and emails the admins.
create or replace function public.submit_training_quiz(p_class uuid, p_answers integer[])
returns public.training_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.training_classes;
  me public.profiles;
  q public.qualifications;
  total integer;
  right_count integer;
  attempt public.training_attempts;
  admin public.profiles;
  site text := (select site_url from public.notification_settings);
  church_today date := (now() at time zone 'America/Chicago')::date;
  who text;
begin
  select * into me from public.profiles where id = auth.uid() and active;
  if not found then
    raise exception 'Only active team members can take classes.';
  end if;
  select * into c from public.training_classes where id = p_class and status = 'approved';
  if not found then
    raise exception 'This class isn''t available yet.';
  end if;
  if c.prerequisite_id is not null and not exists (
    select 1 from public.training_attempts a
     where a.class_id = c.prerequisite_id and a.profile_id = me.id and a.passed
  ) then
    raise exception 'Pass % first.', (select title from public.training_classes where id = c.prerequisite_id);
  end if;

  select count(*), count(*) filter (where p_answers[t.n::int] = ans.correct_index)
    into total, right_count
    from (select tq.id, row_number() over (order by tq.position, tq.created_at) as n
            from public.training_questions tq where tq.class_id = c.id) t
    join public.training_answers ans on ans.question_id = t.id;
  if total = 0 then
    raise exception 'This class has no quiz questions yet.';
  end if;

  insert into public.training_attempts (class_id, profile_id, correct, total, passed)
  values (c.id, me.id, right_count, total, right_count * 100 >= c.pass_percent * total)
  returning * into attempt;

  if attempt.passed and c.qualification_id is not null then
    select * into q from public.qualifications where id = c.qualification_id;
    insert into public.member_qualifications (profile_id, qualification_id, earned_on, expires_on)
    values (me.id, q.id, church_today,
            case when q.valid_months is not null then (church_today + make_interval(months => q.valid_months))::date end)
    on conflict (profile_id, qualification_id)
    do update set earned_on = excluded.earned_on, expires_on = excluded.expires_on;
  end if;

  if attempt.passed then
    who := coalesce(nullif(btrim(me.full_name), ''), me.email);
    for admin in
      select p.* from public.profiles p
        join public.roles r on r.id = p.role_id
       where r.is_admin and p.active and p.id <> me.id and p.notify_by <> 'none'
    loop
      perform public.queue_message(
        'training_complete', 'email', admin.email,
        format('%s passed %s', who, c.title),
        format('Hi %s! %s passed the class "%s" with %s of %s correct.', public.first_name(admin.full_name),
               who, c.title, right_count, total)
          || case when q.id is not null then format(' "%s" was added to their qualifications.', q.name) else '' end
          || format(E'\n\nSee their profile: %s/members/%s - MRBC Safety Team', site, me.id),
        format('training_complete:%s:%s', attempt.id, admin.id)
      );
    end loop;
  end if;

  return attempt;
end;
$$;

revoke all on function public.submit_training_quiz(uuid, integer[]) from public, anon;
grant execute on function public.submit_training_quiz(uuid, integer[]) to authenticated;
