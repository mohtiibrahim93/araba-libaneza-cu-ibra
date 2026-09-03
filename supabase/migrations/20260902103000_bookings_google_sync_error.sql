-- Google Calendar sync was best-effort and silent: when the connector keys are
-- missing or the gateway rejects the call, booking-create logged to the
-- function console and moved on. The booking row kept google_event_id = NULL
-- with nothing to say why, so from the admin panel a booking that never
-- reached the calendar looks exactly like one that did.
--
-- Record the failure on the row instead, so the admin can show it and the
-- calendar health check can report on it.
alter table public.bookings
  add column if not exists google_sync_error text;

comment on column public.bookings.google_sync_error is
  'Last Google Calendar sync failure for this booking (NULL when the event was created, or when no sync has been attempted yet).';
