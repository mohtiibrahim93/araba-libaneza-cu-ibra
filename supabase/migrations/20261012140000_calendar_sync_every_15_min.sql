-- Calendar read-back every 15 minutes instead of every 5, on the owner's
-- decision of 12 October 2026: a third of the runs, and still in step with
-- booking-reminders (also */15), so a lesson moved in Google is picked up
-- before its reminder. The admin calendar still syncs whenever it is opened.
-- Applied to production by hand on 12 October; this file keeps a fresh
-- database from getting the old */5 from 20261011212000.
DO $$
DECLARE job_id bigint;
BEGIN
  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'booking-calendar-sync';
  IF job_id IS NOT NULL THEN
    PERFORM cron.alter_job(job_id, schedule := '*/15 * * * *');
  END IF;
END $$;
