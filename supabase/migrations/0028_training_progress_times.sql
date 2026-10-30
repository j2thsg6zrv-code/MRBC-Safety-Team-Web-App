-- Team training progress for admins (Matt, 2026-10-30): when each member
-- started a class and when they first passed it, so admins can see who has
-- started, where they are, and how long finishing took. Only admins (and the
-- member themselves) can read progress and attempts; the existing policies on
-- training_progress and training_attempts already enforce that.

alter table public.training_progress
  add column started_at timestamptz default now(),
  add column completed_at timestamptz;

-- Rows saved before this change: the real start wasn't recorded, so leave it
-- blank rather than guess. Fill in completion from their first pass.
update public.training_progress set started_at = null;
update public.training_progress p set completed_at = a.first_pass
  from (select profile_id, class_id, min(created_at) as first_pass
          from public.training_attempts where passed group by profile_id, class_id) a
 where a.profile_id = p.profile_id and a.class_id = p.class_id;

-- Members can't change their own start or finish times.
create or replace function public.keep_training_times()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.started_at := now();
    new.completed_at := null;
  else
    new.started_at := old.started_at;
    new.completed_at := old.completed_at;
  end if;
  return new;
end;
$$;

create trigger keep_training_times
  before insert or update on public.training_progress
  for each row
  when (current_setting('app.training_completing', true) is distinct from 'on')
  execute function public.keep_training_times();

-- Stamp the first pass. Runs as the table owner when a quiz is graded.
create or replace function public.stamp_training_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.passed then
    perform set_config('app.training_completing', 'on', true);
    insert into public.training_progress (profile_id, class_id, started_at, completed_at)
    values (new.profile_id, new.class_id, null, new.created_at)
    on conflict (profile_id, class_id)
    do update set completed_at = coalesce(training_progress.completed_at, excluded.completed_at);
    perform set_config('app.training_completing', 'off', true);
  end if;
  return new;
end;
$$;

create trigger stamp_training_completion
  after insert on public.training_attempts
  for each row execute function public.stamp_training_completion();
