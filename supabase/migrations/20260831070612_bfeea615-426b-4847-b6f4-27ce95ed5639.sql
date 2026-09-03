ALTER FUNCTION public.student_name_key(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.student_names_match(text, text) SET search_path = public, pg_temp;