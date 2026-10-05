-- The "notify me" / waiting-list form has never been able to save anything.
--
-- The visitor INSERT policy ("Anyone can submit a course request") requires
-- status = 'new', but course_requests_status_check only allowed 'open',
-- 'grouped', 'converted' and 'closed'. The two contradict each other, so every
-- insert from the site failed — the table was empty on 2026-10-05, and every
-- visitor who asked to be notified saw an error.
--
-- Allow 'new' (a request nobody has looked at yet). The admin moves it on.
alter table public.course_requests
  drop constraint if exists course_requests_status_check;
alter table public.course_requests
  add constraint course_requests_status_check
  check (status = any (array['new', 'open', 'grouped', 'converted', 'closed']));
