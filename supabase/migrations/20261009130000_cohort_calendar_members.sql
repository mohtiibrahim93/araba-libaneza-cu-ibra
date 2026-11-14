-- A group's own students, kept with its calendar name (October 2026).
--
-- Everyone here is a guest of every lesson the admin adds to Google Calendar
-- for the group, permanently. The "invitați în plus" field in the admin stays
-- for other people, invited only to the lessons being added at that moment.
alter table public.cohort_calendar
  add column if not exists members text[] not null default '{}';

comment on column public.cohort_calendar.members is
  'Emails of the group''s students. Invited to every lesson the admin adds to Google Calendar for this group.';

-- When this ran in October 2026 it also put the first student's address on
-- the online A1 group's list. That one-off data step is not kept here: a
-- student's email address does not belong in the repository, and the list is
-- kept in the database, edited from the admin.
