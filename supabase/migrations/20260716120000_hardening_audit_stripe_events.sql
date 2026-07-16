-- Hardening pack (spec-diff adoption): payment traceability, webhook event
-- log, admin audit trail, GDPR anonymization stamp. All idempotent.

-- 1. GDPR: anonymization stamp on registrations (rows with payments are
--    anonymized, never deleted).
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

-- 2. Stripe webhook event log: idempotency (redelivered events are skipped)
--    + forensic trail for disputes. Service-role only: RLS on, no policies.
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,                       -- Stripe evt_… id
  type text NOT NULL,
  registration_id uuid,
  summary jsonb,
  received_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS stripe_events_registration_idx
  ON public.stripe_events (registration_id)
  WHERE registration_id IS NOT NULL;

-- 3. Admin audit log: who did what, when, to which registration.
--    Written and read only through the admin edge function (service role).
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL,                       -- admin email or 'system:stripe'
  action text NOT NULL,                      -- delete/anonymize/update_status/refund/cancel_subscription/…
  registration_id uuid,
  details jsonb
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS audit_logs_registration_idx
  ON public.audit_logs (registration_id)
  WHERE registration_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_created_idx
  ON public.audit_logs (created_at DESC);
