-- Contact email is separate from the verified account/payment ownership mailbox.
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

-- New public group submissions must identify a real matching open group.
-- Existing incomplete records and service-role admin arrangements stay intact.
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

-- A reschedule may race a contact edit. Lock the same registration as the
-- contact RPC and copy its current details during the insert transaction.
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
