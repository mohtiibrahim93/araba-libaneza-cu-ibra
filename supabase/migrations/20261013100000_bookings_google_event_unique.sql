-- One lesson per Google event. The calendar sync now imports lessons the
-- owner puts straight into Google, and it runs from the 15-minute cron and
-- from the admin page; this stops two concurrent syncs importing the same
-- event twice. Checked before applying: no duplicate google_event_id exists.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_google_event_id_uniq
  ON public.bookings (google_event_id)
  WHERE google_event_id IS NOT NULL;
