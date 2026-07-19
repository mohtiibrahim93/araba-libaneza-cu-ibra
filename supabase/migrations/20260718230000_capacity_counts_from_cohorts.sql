-- Make cohorts the single source of truth for seat availability.
--
-- Previously the per-level/format counters (homepage badges) counted only
-- qualified/converted registrations + the manual_signups table, while the
-- cohort picker counted per-cohort linked registrations + manual_offset.
-- The two could disagree (and did: homepage showed 0 taken while cohorts
-- showed 5/3/3). Now the level+format counters are derived from the active
-- cohorts' own numbers, plus legacy unlinked registrations and any
-- manual_signups entries, so both displays always agree.
--
-- Applied directly to the live DB on 2026-07-18; kept here so the repo
-- matches the deployed schema. Idempotent (CREATE OR REPLACE).

CREATE OR REPLACE FUNCTION public.get_group_capacity_counts()
 RETURNS TABLE(form_type text, level text, format text, taken bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH cohort_taken AS (
    -- Seats occupied inside active cohorts: linked qualified/converted
    -- registrations + the cohort's manual offset. Same math as
    -- get_cohort_signup_counts(), summed per level+format, so the level
    -- badges and the cohort picker can never disagree.
    SELECT
      c.form_type,
      CASE WHEN c.form_type = 'kids' THEN NULL ELSE c.level END AS level,
      CASE WHEN c.form_type = 'kids' THEN NULL ELSE c.format END AS format,
      sum(COALESCE(r.n, 0) + COALESCE(c.manual_offset, 0))::bigint AS n
    FROM public.group_cohorts c
    LEFT JOIN (
      SELECT cohort_id, count(*)::bigint AS n
      FROM public.registrations
      WHERE cohort_id IS NOT NULL
        AND lead_status IN ('qualified','converted')
      GROUP BY cohort_id
    ) r ON r.cohort_id = c.id
    WHERE c.is_active
    GROUP BY 1, 2, 3
  ),
  loose_reg AS (
    -- Qualified/converted registrations not linked to any cohort — counted by
    -- their own level+format so legacy rows keep occupying a seat.
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
