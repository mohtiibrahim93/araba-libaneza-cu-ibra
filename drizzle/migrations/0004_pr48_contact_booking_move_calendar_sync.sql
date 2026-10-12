-- lovable-cron-fallback-reviewed: owner explicitly requested 5-minute Google Calendar reconciliation (288 runs/day), cost acknowledged
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS google_contact_email text;
CREATE OR REPLACE FUNCTION public.admin_update_registration_contact(p_id uuid, p_name text, p_email text, p_phone text, p_actor text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE r public.registrations%ROWTYPE;
BEGIN
  IF btrim(p_name) = '' OR length(p_name) > 160 OR length(coalesce(p_email, '')) > 254 OR length(coalesce(p_phone, '')) > 40
     OR (p_email IS NOT NULL AND p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') THEN
    RAISE EXCEPTION 'Invalid contact details';
  END IF;
  SELECT * INTO r FROM public.registrations WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR r.anonymized_at IS NOT NULL THEN RAISE EXCEPTION 'Registration unavailable'; END IF;
  IF p_email IS NULL AND EXISTS (SELECT 1 FROM public.bookings WHERE registration_id = p_id AND status = 'confirmed') THEN
    RAISE EXCEPTION 'Active lessons require a contact email';
  END IF;
  UPDATE public.registrations SET name = p_name, contact_email = coalesce(p_email, ''), phone = coalesce(p_phone, '') WHERE id = p_id;
  UPDATE public.bookings SET google_contact_email = coalesce(google_contact_email, student_email), student_name = p_name, student_email = coalesce(p_email, student_email), student_phone = p_phone,
    google_sync_error = CASE WHEN status = 'confirmed' AND google_event_id IS NOT NULL THEN coalesce(google_sync_error, 'contact_update_pending') ELSE google_sync_error END
    WHERE registration_id = p_id;
  INSERT INTO public.audit_logs(actor, action, registration_id, details)
    VALUES (p_actor, 'update_contact', p_id, jsonb_build_object('fields', ARRAY['name','contact_email','phone']));
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_registration_contact(uuid,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_registration_contact(uuid,text,text,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.require_public_registration_group()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.group_cohorts%ROWTYPE;
BEGIN
  IF NEW.form_type <> 'group' OR coalesce(auth.role(), '') = 'service_role' THEN RETURN NEW; END IF;
  IF NEW.cohort_id IS NULL THEN RAISE EXCEPTION 'Choose a group before continuing' USING ERRCODE = '23514'; END IF;
  SELECT * INTO c FROM public.group_cohorts WHERE id = NEW.cohort_id;
  IF NOT FOUND OR c.is_active IS NOT TRUE OR c.form_type <> 'group' OR c.level IS DISTINCT FROM NEW.level
     OR (c.format IS NOT NULL AND c.format IS DISTINCT FROM NEW.format)
     OR c.status NOT IN ('forming','minimum_reached','confirmed') THEN
    RAISE EXCEPTION 'The selected group is unavailable or does not match the course' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.require_public_registration_group() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS require_public_registration_group ON public.registrations;
CREATE TRIGGER require_public_registration_group BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.require_public_registration_group();

CREATE OR REPLACE FUNCTION public.copy_rescheduled_booking_contact()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.registrations%ROWTYPE; prior_email text;
BEGIN
  IF NEW.original_booking_id IS NULL OR NEW.registration_id IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO r FROM public.registrations WHERE id = NEW.registration_id FOR UPDATE;
  IF FOUND AND r.anonymized_at IS NULL THEN
    IF NEW.student_name IS DISTINCT FROM r.name OR NEW.student_email IS DISTINCT FROM coalesce(nullif(r.contact_email, ''), r.email) OR NEW.student_phone IS DISTINCT FROM r.phone THEN
      NEW.google_sync_error := 'reschedule_update_pending';
    END IF;
    NEW.student_name := r.name;
    NEW.student_email := coalesce(nullif(r.contact_email, ''), r.email, NEW.student_email);
    NEW.student_phone := r.phone;
    SELECT coalesce(google_contact_email, student_email) INTO prior_email FROM public.bookings WHERE id = NEW.original_booking_id;
    NEW.google_contact_email := coalesce(prior_email, NEW.google_contact_email);
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.copy_rescheduled_booking_contact() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS copy_rescheduled_booking_contact ON public.bookings;
CREATE TRIGGER copy_rescheduled_booking_contact BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.copy_rescheduled_booking_contact();

CREATE OR REPLACE FUNCTION public.move_booking_atomically(p_id uuid, p_expected_start timestamptz, p_expected_event text, p_start timestamptz, p_end timestamptz)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE old_booking public.bookings%ROWTYPE; created public.bookings%ROWTYPE; reg_id uuid;
BEGIN
  IF p_end <= p_start THEN RAISE EXCEPTION 'Invalid lesson duration' USING ERRCODE = '23514'; END IF;
  SELECT registration_id INTO reg_id FROM public.bookings WHERE id = p_id;
  IF reg_id IS NOT NULL THEN PERFORM 1 FROM public.registrations WHERE id = reg_id FOR UPDATE; END IF;
  SELECT * INTO old_booking FROM public.bookings WHERE id = p_id FOR UPDATE;
  IF NOT FOUND OR old_booking.status <> 'confirmed' OR old_booking.start_at IS DISTINCT FROM p_expected_start OR old_booking.google_event_id IS DISTINCT FROM p_expected_event THEN
    RAISE EXCEPTION 'Booking changed; reload and retry' USING ERRCODE = '40001';
  END IF;
  UPDATE public.bookings SET status = 'rescheduled' WHERE id = p_id;
  INSERT INTO public.bookings(event_type_slug, registration_id, start_at, end_at, student_name, student_email, student_phone, format, notes, status, original_booking_id, google_event_id, google_contact_email, google_sync_error, meet_link, language)
    VALUES(old_booking.event_type_slug, old_booking.registration_id, p_start, p_end, old_booking.student_name, old_booking.student_email, old_booking.student_phone, old_booking.format, old_booking.notes, 'confirmed', old_booking.id, old_booking.google_event_id,
      coalesce(old_booking.google_contact_email, old_booking.student_email), CASE WHEN old_booking.google_event_id IS NOT NULL THEN 'reschedule_update_pending' ELSE 'missing_calendar_event' END, old_booking.meet_link, old_booking.language)
    RETURNING * INTO created;
  UPDATE public.bookings SET google_event_id = NULL, meet_link = NULL WHERE id = p_id;
  RETURN to_jsonb(created);
END;
$$;
REVOKE ALL ON FUNCTION public.move_booking_atomically(uuid,timestamptz,text,timestamptz,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.move_booking_atomically(uuid,timestamptz,text,timestamptz,timestamptz) TO service_role;

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