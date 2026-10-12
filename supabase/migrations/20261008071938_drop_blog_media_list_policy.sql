-- Moved from Lovable's drizzle/migrations/0000_drop_blog_media_list_policy.sql
-- (applied to production on 8 October 2026), so supabase/migrations is the
-- only migration history. The blog-media bucket is public: files are served
-- by URL without this policy, and dropping it stops anyone listing the bucket.
DROP POLICY IF EXISTS "blog_media_public_read" ON storage.objects;
