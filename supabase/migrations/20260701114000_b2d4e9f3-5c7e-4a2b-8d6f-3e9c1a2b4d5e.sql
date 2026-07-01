-- The INSERT policies on registrations/course_requests only bounded email
-- and phone by length, not format, so a caller hitting the REST API directly
-- (bypassing the client-side isValidEmail/isValidPhone checks in
-- LeadFields.tsx) could still insert garbage like phone = '🎉🎉🎉' or
-- email = '@@@@', which then breaks downstream transactional emails
-- silently. Mirror the same format rules already enforced client-side.
DROP POLICY IF EXISTS "Anyone can submit a registration" ON public.registrations;
CREATE POLICY "Anyone can submit a registration"
  ON public.registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(phone) BETWEEN 3 AND 40
    AND regexp_replace(phone, '[\s().-]', '', 'g') ~ '^(\+[1-9][0-9]{6,14}|0[27][0-9]{8})$'
    AND (email IS NULL OR (length(email) <= 320 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$'))
    AND (notes IS NULL OR length(notes) <= 2000)
    AND lead_status = 'new'
    AND payment_status IN ('unpaid','pending')
    AND is_waitlist_deposit = false
    AND paid_at IS NULL
    AND stripe_session_id IS NULL
    AND whatsapp_sent_at IS NULL
    AND quantity BETWEEN 1 AND 100
  );

DROP POLICY IF EXISTS "Anyone can submit a course request" ON public.course_requests;
CREATE POLICY "Anyone can submit a course request"
  ON public.course_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(phone) BETWEEN 3 AND 40
    AND regexp_replace(phone, '[\s().-]', '', 'g') ~ '^(\+[1-9][0-9]{6,14}|0[27][0-9]{8})$'
    AND (email IS NULL OR (length(email) <= 320 AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$'))
    AND (notes IS NULL OR length(notes) <= 2000)
    AND status = 'new'
  );
