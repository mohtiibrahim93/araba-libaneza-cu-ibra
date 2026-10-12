-- lovable-cron-fallback-reviewed: owner explicitly requested 5-minute Google Calendar reconciliation (288 runs/day), cost acknowledged
-- Schedule calendar-sync every 5 minutes by cloning the booking-reminders job's authenticated command.
DO $$
DECLARE
  v_cmd text;
BEGIN
  SELECT command INTO v_cmd FROM cron.job WHERE jobname = 'booking-reminders-every-15-min' LIMIT 1;
  IF v_cmd IS NULL THEN
    RAISE NOTICE 'booking-reminders job not found; calendar-sync schedule not created';
    RETURN;
  END IF;
  v_cmd := replace(v_cmd, '/functions/v1/booking-reminders', '/functions/v1/calendar-sync');
  PERFORM cron.schedule('booking-calendar-sync', '*/5 * * * *', v_cmd);
END $$;