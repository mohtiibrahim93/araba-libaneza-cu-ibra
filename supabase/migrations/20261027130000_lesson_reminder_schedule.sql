-- Lesson reminders, the owner's schedule (27 October 2026): one every
-- morning at 08:00 Bucharest time from the day after the booking until the
-- lesson day, and one 1 hour before the lesson. Applied by booking-reminders
-- through supabase/functions/_shared/reminder-schedule.ts.
--
-- reminders_from      when the booking was made, or last moved; the schedule
--                     counts from it (nothing on that day's morning, no
--                     hour-before reminder within an hour of it).
-- morning_reminder_on the Bucharest date of the last morning reminder sent.
-- reminders_enabled   false for lessons imported from the owner's Google
--                     Calendar, which never sent reminders (they used to be
--                     switched off by stamping every old reminder column).
--
-- The old per-stage columns (reminder_2d/day_of/3h/30m_sent_at) are left in
-- place, unused, rather than dropped: nothing is lost if this is rolled back.

alter table public.bookings
  add column if not exists reminders_from timestamptz not null default now(),
  add column if not exists morning_reminder_on date,
  add column if not exists reminders_enabled boolean not null default true;

-- Existing bookings count from when they were made, and lessons the
-- calendar sync imported automatically (every old stage stamped with the
-- same instant at import) stay silent.
update public.bookings
   set reminders_from = created_at
 where created_at is not null;

update public.bookings
   set reminders_enabled = false
 where reminder_2d_sent_at is not null
   and reminder_day_of_sent_at is not null
   and reminder_3h_sent_at is not null
   and reminder_1h_sent_at is not null
   and reminder_30m_sent_at is not null
   and reminder_2d_sent_at = reminder_30m_sent_at;

-- A lesson moved to another time starts its reminders again, whichever path
-- moved it (the admin, the student's link, the calendar sync, a stored
-- procedure).
create or replace function public.reset_lesson_reminders_on_move()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.start_at is distinct from old.start_at then
    new.reminders_from := now();
    new.morning_reminder_on := null;
    new.reminder_1h_sent_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reset_lesson_reminders_on_move on public.bookings;
create trigger trg_reset_lesson_reminders_on_move
  before update of start_at on public.bookings
  for each row
  execute function public.reset_lesson_reminders_on_move();
