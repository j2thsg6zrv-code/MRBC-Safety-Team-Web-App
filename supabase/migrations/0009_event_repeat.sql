-- How a repeating event repeats, and the last date it repeats on.
-- Every event in a series (same series_id) carries the same rule and end date.
alter table public.events
  add column repeat_rule text check (repeat_rule in ('weekly', 'biweekly', 'monthly_date', 'monthly_weekday')),
  add column repeat_until date;

-- Series made before this change were all weekly.
update public.events e
set repeat_rule = 'weekly',
    repeat_until = (select max(s.event_date) from public.events s where s.series_id = e.series_id)
where e.series_id is not null;
