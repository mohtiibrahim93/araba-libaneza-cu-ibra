
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.sync_cohort_status_is_active() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_email_confirmation_settings_updated_at() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit a registration" ON public.registrations;
CREATE POLICY "Anyone can submit a registration"
  ON public.registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(phone) BETWEEN 3 AND 40
    AND (email IS NULL OR length(email) <= 320)
    AND (notes IS NULL OR length(notes) <= 2000)
    AND lead_status = 'new'
    AND payment_status IN ('unpaid','pending')
    AND is_waitlist_deposit = false
    AND paid_at IS NULL
    AND stripe_session_id IS NULL
    AND whatsapp_sent_at IS NULL
  );

DROP POLICY IF EXISTS "Anyone can submit a course request" ON public.course_requests;
CREATE POLICY "Anyone can submit a course request"
  ON public.course_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(phone) BETWEEN 3 AND 40
    AND (email IS NULL OR length(email) <= 320)
    AND (notes IS NULL OR length(notes) <= 2000)
    AND status = 'new'
  );
