-- Lock down SECURITY DEFINER internal helpers: revoke EXECUTE from anon+authenticated.
-- Keep only the three counter functions the frontend actually calls via RPC.
REVOKE EXECUTE ON FUNCTION public.check_and_record_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_registration_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;

-- Explicitly (re)grant EXECUTE on public counter RPCs the frontend uses.
GRANT EXECUTE ON FUNCTION public.get_group_capacity_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_cohort_signup_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_kids_slot_signup_counts() TO anon, authenticated;

-- Storage: lock down writes on the public blog-media bucket. Reads remain public
-- (bucket is public), but only service_role may insert/update/delete objects.
CREATE POLICY "blog_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-media');

CREATE POLICY "blog_media_service_write"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'blog-media');

CREATE POLICY "blog_media_service_update"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'blog-media')
  WITH CHECK (bucket_id = 'blog-media');

CREATE POLICY "blog_media_service_delete"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'blog-media');