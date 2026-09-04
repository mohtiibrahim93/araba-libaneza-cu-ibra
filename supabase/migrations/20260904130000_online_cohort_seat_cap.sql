-- Online groups are capped at 6 seats so everyone still gets speaking time over
-- Zoom. In-person cohorts keep 10, which is what the room at Icoanei 80 holds.
--
-- NOT VALID on purpose: the online A1 cohort that started on 2026-08-15 was
-- created with 10 seats and is grandfathered. Every INSERT and every UPDATE
-- from here on is checked, which is what "future online groups are max 6"
-- means. Validate it later, once that cohort has completed:
--   alter table group_cohorts validate constraint group_cohorts_online_max_seats;
alter table group_cohorts
  add constraint group_cohorts_online_max_seats
  check (format is distinct from 'online' or max_seats <= 6)
  not valid;

comment on constraint group_cohorts_online_max_seats on group_cohorts is
  'Online groups are capped at 6 so everyone gets speaking time over Zoom. NOT VALID on purpose: the online A1 cohort that started 2026-08-15 with 10 seats is grandfathered, but every new or edited row is checked. In-person cohorts are unaffected (10 seats).';

-- The new online A1 cohort: Saturdays and Sundays, starting Saturday 17 October
-- 2026 (the first Saturday on or after the 15th, which falls on a Thursday),
-- 32 lessons over 16 weekends, ending Sunday 31 January 2027.
insert into group_cohorts (
  form_type, course_type, age_category, track, level, format,
  start_date, end_date, days_of_week, start_time, end_time, duration_minutes,
  session_count, schedule_label_ro, schedule_label_en,
  max_seats, status, is_active, sort_order, timezone
)
select
  'group', 'grup', 'adulti', 'not_applicable', 'A1', 'online',
  '2026-10-17', '2027-01-31', ARRAY[6,0], '14:00:00', '15:30:00', 90,
  32,
  'Sâmbătă 14:00–15:30 & Duminică 15:00–16:30 · start sâmbătă, 17 octombrie 2026 · 32 de lecții · maximum 6 cursanți',
  'Saturday 14:00–15:30 & Sunday 15:00–16:30 · starts Saturday 17 October 2026 · 32 lessons · max 6 students',
  6, 'forming', true, 0, 'Europe/Bucharest'
where not exists (
  select 1 from group_cohorts
  where level = 'A1' and format = 'online' and start_date = '2026-10-17'
);
