-- The owner answers a student's appeal within 24 hours. If it is still open
-- after 20 hours, booking-reminders emails the owner once; this records it.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS appeal_reminded_at timestamptz;
