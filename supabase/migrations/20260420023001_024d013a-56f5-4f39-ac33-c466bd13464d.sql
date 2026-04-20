-- Tighten the service-role update policy: only rows tied to a Stripe session
DROP POLICY IF EXISTS "Service role can update payment status" ON public.registrations;

CREATE POLICY "Service role can update payment status"
ON public.registrations
FOR UPDATE
TO service_role
USING (stripe_session_id IS NOT NULL)
WITH CHECK (stripe_session_id IS NOT NULL);