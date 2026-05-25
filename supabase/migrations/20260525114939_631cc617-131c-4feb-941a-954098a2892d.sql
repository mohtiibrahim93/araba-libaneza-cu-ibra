-- Remove the PII-leaking SELECT policy
DROP POLICY IF EXISTS "Anyone can count cohort/slot signups" ON public.registrations;

-- Drop redundant service_role ALL policies (service_role bypasses RLS by default)
DROP POLICY IF EXISTS "Service role manages cohorts" ON public.group_cohorts;
DROP POLICY IF EXISTS "Service role manages kids slots" ON public.kids_class_slots;

-- Safe aggregate count function for cohorts
CREATE OR REPLACE FUNCTION public.get_cohort_signup_counts()
RETURNS TABLE(cohort_id uuid, taken bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cohort_id, count(*)::bigint
  FROM public.registrations
  WHERE cohort_id IS NOT NULL
  GROUP BY cohort_id;
$$;

-- Safe aggregate count function for kids slots
CREATE OR REPLACE FUNCTION public.get_kids_slot_signup_counts()
RETURNS TABLE(kids_slot_id uuid, taken bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT kids_slot_id, count(*)::bigint
  FROM public.registrations
  WHERE kids_slot_id IS NOT NULL
  GROUP BY kids_slot_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_cohort_signup_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_kids_slot_signup_counts() TO anon, authenticated;