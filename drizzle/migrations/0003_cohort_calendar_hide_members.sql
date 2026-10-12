REVOKE SELECT ON public.cohort_calendar FROM anon, authenticated;
GRANT SELECT (cohort_id, calendar_title, total_lessons, created_at) ON public.cohort_calendar TO anon, authenticated;
GRANT ALL ON public.cohort_calendar TO service_role;