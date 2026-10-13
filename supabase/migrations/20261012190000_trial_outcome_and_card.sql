-- Free-trial rules confirmed by the owner on 12 October 2026.
--
-- A trial counts as used when it took place, or when the owner marks a late
-- cancellation / no-show as lost. It does not count when the student cancels
-- more than 24h ahead, when the centre cancels, or when the owner excuses a
-- late cancellation / no-show. 24h after the lesson, with nothing marked, it
-- counts as done; the owner can change the outcome at any time.
-- One trial per person: by email, and by card (Stripe card fingerprint), so a
-- second email with the same card is refused.

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS trial_outcome text;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_trial_outcome_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_trial_outcome_check
  CHECK (trial_outcome IS NULL OR trial_outcome IN ('done', 'excused', 'lost'));
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS trial_outcome_at timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS trial_outcome_by text;

ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS card_fingerprint text;
CREATE INDEX IF NOT EXISTS idx_registrations_card_fingerprint
  ON public.registrations (card_fingerprint) WHERE card_fingerprint IS NOT NULL;

-- Whether a trial booking uses up the free trial. Kept in one place so the
-- checkout, the booking and the admin read the same rule.
CREATE OR REPLACE FUNCTION public.trial_booking_counts(p_status text, p_outcome text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT (p_status IN ('confirmed', 'completed') AND coalesce(p_outcome, '') <> 'excused')
      OR p_outcome = 'lost';
$$;

-- 'email' when this email already used its trial, 'card' when the same card
-- did under another email, NULL when the trial is still available.
CREATE OR REPLACE FUNCTION public.trial_already_used(p_email text, p_card_fingerprint text DEFAULT NULL)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM public.bookings b
       WHERE b.event_type_slug = 'trial'
         AND lower(b.student_email) = lower(btrim(p_email))
         AND public.trial_booking_counts(b.status, b.trial_outcome)
    ) THEN 'email'
    WHEN p_card_fingerprint IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.registrations r
        JOIN public.bookings b ON b.registration_id = r.id
       WHERE r.card_fingerprint = p_card_fingerprint
         AND lower(coalesce(r.email, '')) <> lower(btrim(p_email))
         AND b.event_type_slug = 'trial'
         AND public.trial_booking_counts(b.status, b.trial_outcome)
    ) THEN 'card'
    ELSE NULL
  END;
$$;
REVOKE ALL ON FUNCTION public.trial_already_used(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trial_already_used(text, text) TO service_role;
