-- Group-course monthly subscriptions: track the Stripe subscription and its
-- billing progress on the registration row. All additive + idempotent so it is
-- safe to (re)apply. Private (one-time) registrations simply leave these NULL.

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS months_total integer,
  ADD COLUMN IF NOT EXISTS months_paid integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_amount integer;

-- The webhook and admin cancel/refund look registrations up by subscription id.
CREATE INDEX IF NOT EXISTS registrations_stripe_subscription_id_idx
  ON public.registrations (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
