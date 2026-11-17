-- The student's request to start lessons inside the 14-day withdrawal period
-- (owner, 17 November 2026: "protect me from free lessons"; OUG 34/2014,
-- art. 8 alin. (8) and art. 14).
--
-- Anyone who signs up online may withdraw within 14 days. If a group starts
-- inside those 14 days, the student may join it only by asking, with a box
-- they tick themselves at payment, for the lessons to start in that time;
-- if they then withdraw, they pay for the lessons already held. This column
-- is when that request was made: set by the server when the box is ticked,
-- or by the owner in the admin for a request received by email or WhatsApp.
-- Null = no request.
--
-- Additive: one nullable column, no row changes. Written so it can run again.

alter table public.registrations
  add column if not exists early_start_requested_at timestamptz;

comment on column public.registrations.early_start_requested_at is
  'When the student asked for lessons to start inside the 14-day withdrawal period (box at payment, or recorded by the owner). Null = no request. Lessons held are then paid on withdrawal.';
