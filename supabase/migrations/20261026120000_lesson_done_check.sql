-- After a lesson (owner's request, 14 October 2026): the student is emailed
-- to confirm it took place; if nobody confirms, the lesson counts as done 48
-- hours after it ended (booking-reminders, every 15 minutes).
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS done_check_sent_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS completed_by text;
DO $$ BEGIN
  ALTER TABLE public.bookings ADD CONSTRAINT bookings_completed_by_check
    CHECK (completed_by IS NULL OR completed_by IN ('student', 'auto', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- No email about a lesson that ended before this started: those are only
-- marked done (after 48 hours) by the job.
UPDATE public.bookings SET done_check_sent_at = now()
WHERE end_at <= now() AND done_check_sent_at IS NULL;
