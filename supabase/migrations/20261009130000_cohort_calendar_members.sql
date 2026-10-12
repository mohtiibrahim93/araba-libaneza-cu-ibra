-- A group's own students, kept with its calendar name (October 2026).
--
-- Everyone here is a guest of every lesson the admin adds to Google Calendar
-- for the group, permanently. The "invitați în plus" field in the admin stays
-- for other people, invited only to the lessons being added at that moment.
alter table public.cohort_calendar
  add column if not exists members text[] not null default '{}';

comment on column public.cohort_calendar.members is
  'Emails of the group''s students. Invited to every lesson the admin adds to Google Calendar for this group.';

-- The owner's first: the student who joined the online A1 group in October.
update public.cohort_calendar
set members = array['bandaricaefrem@gmail.com']
where cohort_id = 'a3856160-b378-4543-aab9-4242765aa835'
  and not ('bandaricaefrem@gmail.com' = any(members));
