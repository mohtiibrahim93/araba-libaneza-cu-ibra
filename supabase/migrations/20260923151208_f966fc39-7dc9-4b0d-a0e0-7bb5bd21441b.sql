REVOKE EXECUTE ON FUNCTION public.enforce_contact_message_rate_limit() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_contact_message_rate_limit() TO service_role;