-- A bonus lesson, the owner's gift (2 Nov 2026): booked as a bonus or marked as
-- one later, it never counts in the student's package (package-lessons.ts).
-- The owner's word on a lesson lives in bookings.trial_outcome; this adds
-- 'bonus' to the values it accepts. Nothing existing changes.
alter table public.bookings
  drop constraint if exists bookings_trial_outcome_check;
alter table public.bookings
  add constraint bookings_trial_outcome_check
  check (
    trial_outcome is null
    or trial_outcome = any (array['done', 'excused', 'lost', 'bonus'])
  );
