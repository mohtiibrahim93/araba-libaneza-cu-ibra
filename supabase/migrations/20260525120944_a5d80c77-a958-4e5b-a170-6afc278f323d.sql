
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_form_type_check;
ALTER TABLE public.registrations ADD CONSTRAINT registrations_form_type_check
  CHECK (form_type = ANY (ARRAY['group'::text, 'private'::text, 'kids'::text, 'trial'::text]));

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS trial_followup_sent_at timestamptz;
CREATE INDEX IF NOT EXISTS bookings_trial_followup_idx
  ON public.bookings (event_type_slug, end_at)
  WHERE trial_followup_sent_at IS NULL;
