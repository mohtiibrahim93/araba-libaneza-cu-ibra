-- Absences with a good reason, per student and group lesson (owner, 17
-- November 2026: "the mark for an absense with good reason yes"; Terms,
-- section 4 "Absențe": a lesson counts as held even if the student was
-- absent, except in special situations we accept).
--
-- One row per student and lesson the owner excused. The refund rules then
-- count that lesson as not held for that student (_shared/cancel-request.ts,
-- _shared/group-refund.ts).
--
-- The lesson is named by its Google Calendar event (cohort_sessions.
-- google_event_id), which stays the same when the lesson is moved or the
-- calendar is synced again; a lesson cancelled in the calendar is no longer
-- held by anyone, so its mark simply stops mattering.
--
-- Additive: one new table, read and written only by the server (row level
-- security on, no policy), like student_credits. Written so it can run again.

create table if not exists public.lesson_excusals (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  google_event_id text not null check (char_length(google_event_id) between 1 and 1024),
  -- when the lesson was when it was marked, for reading only: the time that
  -- counts is the lesson's current one in cohort_sessions
  lesson_starts_at timestamptz not null,
  reason text check (reason is null or char_length(reason) <= 300),
  recorded_by text not null check (char_length(recorded_by) between 1 and 255),
  created_at timestamptz not null default now(),
  constraint lesson_excusals_once unique (registration_id, google_event_id)
);

create index if not exists lesson_excusals_registration_idx
  on public.lesson_excusals (registration_id);

alter table public.lesson_excusals enable row level security;

comment on table public.lesson_excusals is
  'Group lessons the owner excused for one student (absence with a good reason). Refunds count them as not held for that student.';

-- Belt and braces: with row level security on and no policy, visitors and
-- signed-in students already see nothing; they are given no table rights
-- either.
revoke all on public.lesson_excusals from anon, authenticated;
