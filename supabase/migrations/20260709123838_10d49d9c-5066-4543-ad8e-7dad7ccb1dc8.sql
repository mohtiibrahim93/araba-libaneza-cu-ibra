ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS months_total integer,
  ADD COLUMN IF NOT EXISTS months_paid integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_amount integer;

CREATE INDEX IF NOT EXISTS registrations_stripe_subscription_id_idx
  ON public.registrations (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;