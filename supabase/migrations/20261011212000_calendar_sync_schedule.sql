-- Reuse the established reminders job's authenticated HTTP configuration.
-- Never create a scheduler with an empty guessed secret.
DO $$
DECLARE reminder_command text;
BEGIN
  SELECT command INTO reminder_command FROM cron.job
    WHERE command LIKE '%/functions/v1/booking-reminders%' ORDER BY jobid LIMIT 1;
  IF reminder_command IS NOT NULL THEN
    PERFORM cron.schedule('booking-calendar-sync', '*/5 * * * *', replace(reminder_command, '/functions/v1/booking-reminders', '/functions/v1/calendar-sync'));
  ELSE
    RAISE NOTICE 'Calendar sync schedule not installed: configure the existing CRON_SECRET authenticated HTTP job during deployment.';
  END IF;
END;
$$;
