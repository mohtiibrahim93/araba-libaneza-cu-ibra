
ALTER TABLE public.group_capacities
  ADD COLUMN IF NOT EXISTS manual_offset INT NOT NULL DEFAULT 0 CHECK (manual_offset >= 0);

ALTER TABLE public.group_cohorts
  ADD COLUMN IF NOT EXISTS manual_offset INT NOT NULL DEFAULT 0 CHECK (manual_offset >= 0);

CREATE OR REPLACE FUNCTION public.get_group_capacity_counts()
 RETURNS TABLE(form_type text, level text, taken bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    gc.form_type,
    gc.level,
    (COALESCE(r.taken, 0) + COALESCE(gc.manual_offset, 0))::bigint AS taken
  FROM public.group_capacities gc
  LEFT JOIN (
    SELECT form_type, level, count(*)::bigint AS taken
    FROM public.registrations
    WHERE form_type IN ('group','kids')
      AND lead_status IN ('qualified','converted')
    GROUP BY form_type, level
  ) r ON r.form_type = gc.form_type AND r.level IS NOT DISTINCT FROM gc.level;
$function$;

CREATE OR REPLACE FUNCTION public.get_cohort_signup_counts()
 RETURNS TABLE(cohort_id uuid, taken bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    c.id AS cohort_id,
    (COALESCE(r.taken, 0) + COALESCE(c.manual_offset, 0))::bigint AS taken
  FROM public.group_cohorts c
  LEFT JOIN (
    SELECT cohort_id, count(*)::bigint AS taken
    FROM public.registrations
    WHERE cohort_id IS NOT NULL
      AND lead_status IN ('qualified','converted')
    GROUP BY cohort_id
  ) r ON r.cohort_id = c.id;
$function$;
