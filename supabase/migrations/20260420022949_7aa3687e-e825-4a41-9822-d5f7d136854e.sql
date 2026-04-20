-- Add payment tracking columns
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Index for fast webhook lookup
CREATE INDEX IF NOT EXISTS registrations_stripe_session_id_idx
  ON public.registrations (stripe_session_id);

-- Allow service role to update payment status (for stripe-webhook)
CREATE POLICY "Service role can update payment status"
ON public.registrations
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);