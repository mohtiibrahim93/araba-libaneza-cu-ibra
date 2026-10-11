-- Keep Lovable's already-applied privacy change in the Supabase migration
-- history used by this repository. Safe to apply again; no rows are changed.
REVOKE SELECT ON public.cohort_calendar FROM anon, authenticated;
GRANT SELECT (cohort_id, calendar_title, total_lessons, created_at) ON public.cohort_calendar TO anon, authenticated;
GRANT ALL ON public.cohort_calendar TO service_role;
