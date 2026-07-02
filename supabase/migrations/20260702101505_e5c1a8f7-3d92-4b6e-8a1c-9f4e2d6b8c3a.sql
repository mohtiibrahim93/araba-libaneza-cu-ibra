-- Refund workflow: previously refunds were only doable by hand in the
-- Stripe dashboard with no record on the registration itself and no
-- audit trail. Add the columns; the admin-registrations edge function's
-- new "refund" action calls Stripe's refund API and writes these.
ALTER TABLE public.registrations
  ADD COLUMN refunded_at timestamptz,
  ADD COLUMN refund_reason text;
