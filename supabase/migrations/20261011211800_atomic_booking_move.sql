-- Keep claim, replacement, and Calendar link transfer in one transaction.
-- Lock the registration first, in the same order as contact edits.
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
