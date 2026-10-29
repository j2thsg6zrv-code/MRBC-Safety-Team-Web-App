-- Passing a training class adds its certification to the member's
-- My Certifications (Matt, 2026-10-29). Each class now names the certification
-- it earns. Existing classes get a certification with the same name and
-- length as the qualification they already earned (they keep earning that
-- qualification too, so position requirements still work), and everyone who
-- already passed a class gets its certification with the same dates.

alter table public.training_classes
  add column if not exists certification_id uuid references public.certifications (id) on delete set null;
create index if not exists training_classes_certification_id_idx on public.training_classes (certification_id);

insert into public.certifications (name, description, valid_months)
select distinct q.name, q.description, q.valid_months
  from public.training_classes c
  join public.qualifications q on q.id = c.qualification_id
on conflict (name) do nothing;

update public.training_classes c
   set certification_id = cert.id
  from public.qualifications q, public.certifications cert
 where q.id = c.qualification_id and cert.name = q.name and c.certification_id is null;

insert into public.member_certifications (profile_id, certification_id, earned_on, expires_on)
select distinct on (mq.profile_id, c.certification_id) mq.profile_id, c.certification_id, mq.earned_on, mq.expires_on
  from public.training_classes c
  join public.member_qualifications mq on mq.qualification_id = c.qualification_id
 where c.certification_id is not null
   and exists (select 1 from public.training_attempts a where a.class_id = c.id and a.profile_id = mq.profile_id and a.passed)
 order by mq.profile_id, c.certification_id, mq.earned_on desc
on conflict (profile_id, certification_id) do nothing;

-- Grades a quiz. p_answers holds the chosen choice (0 = first) for each
-- question in position order. Passing adds or renews the class's
-- certification (and qualification, if it has one) and emails the admins.
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
  cert public.certifications;
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

  if attempt.passed and c.certification_id is not null then
    select * into cert from public.certifications where id = c.certification_id;
    insert into public.member_certifications (profile_id, certification_id, earned_on, expires_on)
    values (me.id, cert.id, church_today,
            case when cert.valid_months is not null then (church_today + make_interval(months => cert.valid_months))::date end)
    on conflict (profile_id, certification_id)
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
          || case when cert.id is not null then format(' "%s" was added to their certifications.', cert.name) else '' end
          || case when q.id is not null then format(' "%s" was added to their qualifications.', q.name) else '' end
          || format(E'\n\nSee their profile: %s/members/%s - MRBC Safety Team', site, me.id),
        format('training_complete:%s:%s', attempt.id, admin.id)
      );
    end loop;
  end if;

  return attempt;
end;
$$;

