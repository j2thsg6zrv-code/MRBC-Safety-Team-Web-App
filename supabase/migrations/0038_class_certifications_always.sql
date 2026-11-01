-- Passing a class always shows up on My Certifications (Matt, 2026-11-01).
-- Classes imported from PowerPoint started with no certification, so passing
-- "Church Safety Team De-Escalation" added nothing to Matt's certifications.
--
-- 1. Link the imported classes to their matching certification and
--    qualification, and give everyone who already passed a class the
--    certification and qualification it earns, dated the day they passed.
-- 2. From now on, a class that is approved without a certification gets one
--    named after the class (good for 24 months, like the others).
-- 3. Whenever an admin sets or changes a class's certification or
--    qualification, everyone who already passed that class gets it too.

-- 1. Fix the classes that have no certification.
insert into public.certifications (name, description, valid_months)
select q.name, q.description, q.valid_months
  from public.training_classes c
  join public.qualifications q on q.id = c.qualification_id
 where c.certification_id is null
on conflict (name) do nothing;

update public.training_classes c
   set certification_id = cert.id
  from public.qualifications q, public.certifications cert
 where q.id = c.qualification_id and cert.name = q.name and c.certification_id is null;

update public.training_classes
   set qualification_id = coalesce(qualification_id, (select id from public.qualifications where name = 'Verbal De-escalation')),
       certification_id = coalesce(certification_id, (select id from public.certifications where name = 'Verbal De-escalation'))
 where title ilike '%de-escalation%';

update public.training_classes
   set qualification_id = coalesce(qualification_id, (select id from public.qualifications where name = 'Child Protection')),
       certification_id = coalesce(certification_id, (select id from public.certifications where name = 'Child Protection'))
 where title ilike 'child safety%';

-- Gives everyone who passed a class its certification and qualification
-- (keeps any newer dates they already have).
create or replace function public.grant_class_credentials_to_past_passers(p_class uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.member_certifications (profile_id, certification_id, earned_on, expires_on)
  select distinct on (a.profile_id) a.profile_id, cert.id, d.passed_on,
         case when cert.valid_months is not null then (d.passed_on + make_interval(months => cert.valid_months))::date end
    from public.training_attempts a
    join public.training_classes c on c.id = a.class_id
    join public.certifications cert on cert.id = c.certification_id
    cross join lateral (select (a.created_at at time zone 'America/Chicago')::date as passed_on) d
   where a.class_id = p_class and a.passed
   order by a.profile_id, a.created_at desc
  on conflict (profile_id, certification_id) do update
    set earned_on = excluded.earned_on, expires_on = excluded.expires_on
    where member_certifications.earned_on < excluded.earned_on;

  insert into public.member_qualifications (profile_id, qualification_id, earned_on, expires_on)
  select distinct on (a.profile_id) a.profile_id, q.id, d.passed_on,
         case when q.valid_months is not null then (d.passed_on + make_interval(months => q.valid_months))::date end
    from public.training_attempts a
    join public.training_classes c on c.id = a.class_id
    join public.qualifications q on q.id = c.qualification_id
    cross join lateral (select (a.created_at at time zone 'America/Chicago')::date as passed_on) d
   where a.class_id = p_class and a.passed
   order by a.profile_id, a.created_at desc
  on conflict (profile_id, qualification_id) do update
    set earned_on = excluded.earned_on, expires_on = excluded.expires_on
    where member_qualifications.earned_on < excluded.earned_on;
end;
$$;
revoke all on function public.grant_class_credentials_to_past_passers(uuid) from public, anon, authenticated;

select public.grant_class_credentials_to_past_passers(id) from public.training_classes;

-- 2. An approved class always earns a certification.
create or replace function public.training_class_needs_certification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and new.certification_id is null then
    insert into public.certifications (name, valid_months)
    values (left(btrim(new.title), 120), 24)
    on conflict (name) do update set name = excluded.name
    returning id into new.certification_id;
  end if;
  return new;
end;
$$;

drop trigger if exists training_class_needs_certification on public.training_classes;
create trigger training_class_needs_certification
  before insert or update of status, certification_id on public.training_classes
  for each row execute function public.training_class_needs_certification();

-- 3. Changing what a class earns catches up everyone who already passed it.
create or replace function public.training_class_credentials_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.certification_id is distinct from old.certification_id
     or new.qualification_id is distinct from old.qualification_id then
    perform public.grant_class_credentials_to_past_passers(new.id);
  end if;
  return null;
end;
$$;

drop trigger if exists training_class_credentials_changed on public.training_classes;
create trigger training_class_credentials_changed
  after update of certification_id, qualification_id on public.training_classes
  for each row execute function public.training_class_credentials_changed();
