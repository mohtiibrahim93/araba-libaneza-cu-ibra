-- Manual signups reflect automatically in cohorts (owner requirement).
--
-- A manual signup logged in the admin "Înscrieri manuale" panel previously
-- counted only toward the level+format badge, never on the cohort card. Now
-- each group manual signup carries an optional cohort_id (auto-attached by
-- the admin edge function to the level+format's single active cohort), and:
--   * get_cohort_signup_counts() adds attached manual signups to the cohort;
--   * get_group_capacity_counts() counts attached rows via the cohort and
--     only unattached rows directly — never double.
--
-- Applied directly to the live DB on 2026-07-19 and verified with a live
-- insert (+2 moved both counters 3 → 5 identically). Idempotent.

ALTER TABLE public.manual_signups
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES public.group_cohorts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_manual_signups_cohort
  ON public.manual_signups (cohort_id) WHERE cohort_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_cohort_signup_counts()
 RETURNS TABLE(cohort_id uuid, taken bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    c.id AS cohort_id,
    (COALESCE(r.taken, 0) + COALESCE(c.manual_offset, 0) + COALESCE(ms.n, 0))::bigint AS taken
  FROM public.group_cohorts c
  LEFT JOIN (
    SELECT cohort_id, count(*)::bigint AS taken
    FROM public.registrations
    WHERE cohort_id IS NOT NULL
      AND lead_status IN ('qualified','converted')
    GROUP BY cohort_id
  ) r ON r.cohort_id = c.id
  LEFT JOIN (
    SELECT cohort_id, sum(count)::bigint AS n
    FROM public.manual_signups
    WHERE cohort_id IS NOT NULL
    GROUP BY cohort_id
  ) ms ON ms.cohort_id = c.id;
$function$;

CREATE OR REPLACE FUNCTION public.get_group_capacity_counts()
 RETURNS TABLE(form_type text, level text, format text, taken bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH cohort_taken AS (
    SELECT
      c.form_type,
      CASE WHEN c.form_type = 'kids' THEN NULL ELSE c.level END AS level,
      CASE WHEN c.form_type = 'kids' THEN NULL ELSE c.format END AS format,
      sum(COALESCE(r.n, 0) + COALESCE(c.manual_offset, 0) + COALESCE(ms.n, 0))::bigint AS n
    FROM public.group_cohorts c
    LEFT JOIN (
      SELECT cohort_id, count(*)::bigint AS n
      FROM public.registrations
      WHERE cohort_id IS NOT NULL
        AND lead_status IN ('qualified','converted')
      GROUP BY cohort_id
    ) r ON r.cohort_id = c.id
    LEFT JOIN (
      SELECT cohort_id, sum(count)::bigint AS n
      FROM public.manual_signups
      WHERE cohort_id IS NOT NULL
      GROUP BY cohort_id
    ) ms ON ms.cohort_id = c.id
    WHERE c.is_active
    GROUP BY 1, 2, 3
  ),
  loose_reg AS (
    SELECT
      r.form_type,
      CASE WHEN r.form_type = 'kids' THEN NULL ELSE r.level END AS level,
      CASE WHEN r.form_type = 'kids' THEN NULL ELSE r.format END AS format,
      count(*)::bigint AS n
    FROM public.registrations r
    WHERE r.form_type IN ('group','kids')
      AND r.lead_status IN ('qualified','converted')
      AND r.cohort_id IS NULL
    GROUP BY 1, 2, 3
  ),
  man AS (
    SELECT
      m.form_type,
      CASE WHEN m.form_type = 'kids' THEN NULL ELSE m.level END AS level,
      CASE WHEN m.form_type = 'kids' THEN NULL ELSE m.format END AS format,
      COALESCE(sum(m.count), 0)::bigint AS n
    FROM public.manual_signups m
    WHERE m.cohort_id IS NULL
    GROUP BY 1, 2, 3
  ),
  unioned AS (
    SELECT * FROM cohort_taken
    UNION ALL SELECT * FROM loose_reg
    UNION ALL SELECT * FROM man
  )
  SELECT u.form_type, u.level, u.format, sum(u.n)::bigint AS taken
  FROM unioned u
  GROUP BY 1, 2, 3;
$function$;
