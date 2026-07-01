-- The paid amount for group/private checkouts was being fully derived from a
-- client-supplied `quantity` in create-payment-intent, with nothing server-side
-- tying it back to what the customer actually registered for. Persist the
-- agreed quantity (private lesson count, or group months) on the registration
-- row itself at submission time so the payment function can read it from the
-- database instead of trusting the request body.
ALTER TABLE public.registrations
  ADD COLUMN quantity integer NOT NULL DEFAULT 1
  CHECK (quantity BETWEEN 1 AND 100);

-- Require it to stay within bounds on insert too (defense in depth alongside
-- the CHECK constraint above, matching the pattern already used for
-- name/phone/email length in the "Anyone can submit a registration" policy).
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
    AND quantity BETWEEN 1 AND 100
  );
