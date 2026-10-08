-- Group lessons, one row each (October 2026).
--
-- A cohort used to be only a weekly pattern (cohort_meetings), so nothing knew
-- which numbered lesson a running group was on. The owner keeps the real
-- lessons in Google Calendar, titled "<course>-L<N>" ("Adulti-A1- Grupa 2-
-- Libaneza-L11"; "Lecția N" is read too). The admin's calendar sync
-- (admin-registrations: sync_cohort_sessions) reads those events into this
-- table, and can add the remaining lessons of the course to the calendar.
--
-- Google Calendar stays the source of truth: a lesson moved, cancelled or
-- skipped for a break is changed there, and the next sync follows it.
--
-- Dates and lesson numbers are public — they drive the "Lecția 18 din 32"
-- progress on the course pages. No meeting link, attendee or description is
-- stored here.

-- The calendar name and course length of a group live in their own table,
-- not as columns on group_cohorts: that table carries NOT VALID seat caps
-- (online <= 6) that the running A1 online group (10 seats) predates, so any
-- UPDATE of its row is rejected. A side table leaves those rows untouched.
create table if not exists public.cohort_calendar (
  cohort_id uuid primary key references public.group_cohorts(id) on delete cascade,
  -- The event title before the lesson number, as it is in the calendar.
  calendar_title text not null,
  -- Lessons in the whole course (A1 32, A2 56, from the curriculum). Joining,
  -- with free catch-up lessons, is possible until total_lessons - 8.
  total_lessons integer not null check (total_lessons > 0),
  created_at timestamptz not null default now()
);

alter table public.cohort_calendar enable row level security;

drop policy if exists "Anyone can read calendar links of active cohorts" on public.cohort_calendar;
create policy "Anyone can read calendar links of active cohorts"
  on public.cohort_calendar for select
  to anon, authenticated
  using (exists (
    select 1 from public.group_cohorts g
    where g.id = cohort_calendar.cohort_id and g.is_active = true
  ));

drop policy if exists "Service role manages calendar links" on public.cohort_calendar;
create policy "Service role manages calendar links"
  on public.cohort_calendar for all
  to service_role
  using (true) with check (true);

create table if not exists public.cohort_sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.group_cohorts(id) on delete cascade,
  lesson_number integer not null check (lesson_number > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  google_event_id text not null,
  -- 'calendar' = found in the owner's calendar; 'generated' = added by the sync.
  source text not null default 'calendar' check (source in ('calendar', 'generated')),
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint cohort_sessions_time_order check (ends_at > starts_at),
  constraint cohort_sessions_event_unique unique (google_event_id)
);

create index if not exists idx_cohort_sessions_cohort_start
  on public.cohort_sessions (cohort_id, starts_at);

alter table public.cohort_sessions enable row level security;

drop policy if exists "Anyone can read sessions of active cohorts" on public.cohort_sessions;
create policy "Anyone can read sessions of active cohorts"
  on public.cohort_sessions for select
  to anon, authenticated
  using (exists (
    select 1 from public.group_cohorts g
    where g.id = cohort_sessions.cohort_id and g.is_active = true
  ));

drop policy if exists "Service role manages cohort sessions" on public.cohort_sessions;
create policy "Service role manages cohort sessions"
  on public.cohort_sessions for all
  to service_role
  using (true) with check (true);

-- The three groups running now, with their names as they are in the calendar
-- (read 8 Oct 2026) and the course length from the curriculum.
insert into public.cohort_calendar (cohort_id, calendar_title, total_lessons) values
  ('a3856160-b378-4543-aab9-4242765aa835', 'Curs A1 online Araba Libaneza', 32),
  ('4b87184c-80a5-41eb-86db-419062c4e6fc', 'Adulti- A2- Grupa 1- Libaneza', 56),
  ('f641b21a-f4e8-420a-b513-e748811e0636', 'Adulti-A1- Grupa 2- Libaneza', 32)
on conflict (cohort_id) do update
  set calendar_title = excluded.calendar_title, total_lessons = excluded.total_lessons;
