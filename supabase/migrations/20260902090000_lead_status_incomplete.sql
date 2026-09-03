-- A trial form where step 1 was submitted but no time slot was ever chosen is
-- not a booking. It used to be flagged with a warning string inside the
-- free-text `notes` column, which meant it could not be filtered and sat in the
-- admin looking like a genuine lead.
--
-- The application now writes lead_status = 'incomplete' for those, and
-- booking-create promotes the row to 'new' once a slot is actually booked. The
-- CHECK constraint predates that value, so inserting one failed and took the
-- whole step-1 submit down with it ("rezervarea a eșuat" before the visitor
-- could reach the scheduling step).
alter table public.registrations
  drop constraint if exists registrations_lead_status_check;

alter table public.registrations
  add constraint registrations_lead_status_check
  check (lead_status = any (array[
    'incomplete'::text,
    'new'::text,
    'contacted'::text,
    'qualified'::text,
    'no_response'::text,
    'not_suitable'::text,
    'spam'::text,
    'converted'::text
  ]));
