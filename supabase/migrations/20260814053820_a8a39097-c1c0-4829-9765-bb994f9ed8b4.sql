REVOKE ALL ON FUNCTION public.get_cohort_signup_counts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_group_capacity_counts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_kids_slot_signup_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cohort_signup_counts() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_group_capacity_counts() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_kids_slot_signup_counts() TO anon, authenticated, service_role;