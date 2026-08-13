REVOKE EXECUTE ON FUNCTION public.find_or_create_student(text, text, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_bookings_attach_student() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_registrations_attach_student() FROM anon, authenticated, PUBLIC;