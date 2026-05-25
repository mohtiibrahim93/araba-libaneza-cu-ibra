-- Remove unrestricted public INSERT on bookings; the booking-create edge function
-- uses the service role and validates input, so no anon INSERT is needed.
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;