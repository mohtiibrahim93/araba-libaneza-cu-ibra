ALTER TABLE public.group_capacities ADD COLUMN IF NOT EXISTS format text;

UPDATE public.group_capacities SET format = 'fizic' WHERE form_type = 'group' AND format IS NULL;

DROP INDEX IF EXISTS public.group_capacities_form_level_null_idx;
ALTER TABLE public.group_capacities DROP CONSTRAINT IF EXISTS group_capacities_form_type_level_key;

CREATE UNIQUE INDEX IF NOT EXISTS group_capacities_form_level_format_idx
  ON public.group_capacities (form_type, COALESCE(level, ''), COALESCE(format, ''));

INSERT INTO public.group_capacities (form_type, level, format, max_seats, min_seats)
SELECT 'group', level, 'online', 10, 4
FROM public.group_capacities
WHERE form_type = 'group' AND format = 'fizic'
ON CONFLICT (form_type, COALESCE(level, ''), COALESCE(format, '')) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.manual_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL CHECK (form_type IN ('group', 'kids')),
  level text,
  format text CHECK (format IS NULL OR format IN ('fizic', 'online')),
  source text NOT NULL DEFAULT 'other',
  count integer NOT NULL DEFAULT 0 CHECK (count >= 0 AND count <= 1000),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.manual_signups TO service_role;

ALTER TABLE public.manual_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages manual signups" ON public.manual_signups;
CREATE POLICY "Service role manages manual signups"
  ON public.manual_signups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP FUNCTION IF EXISTS public.get_group_capacity_counts();

CREATE FUNCTION public.get_group_capacity_counts()
RETURNS TABLE(form_type text, level text, format text, taken bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH reg AS (
    SELECT
      r.form_type,
      CASE WHEN r.form_type = 'kids' THEN NULL ELSE r.level END AS level,
      CASE WHEN r.form_type = 'kids' THEN NULL ELSE r.format END AS format,
      count(*)::bigint AS n
    FROM public.registrations r
    WHERE r.form_type IN ('group', 'kids')
      AND r.lead_status IN ('qualified', 'converted')
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
  )
  SELECT
    COALESCE(reg.form_type, man.form_type) AS form_type,
    COALESCE(reg.level, man.level) AS level,
    COALESCE(reg.format, man.format) AS format,
    (COALESCE(reg.n, 0) + COALESCE(man.n, 0))::bigint AS taken
  FROM reg
  FULL OUTER JOIN man
    ON reg.form_type = man.form_type
   AND reg.level IS NOT DISTINCT FROM man.level
   AND reg.format IS NOT DISTINCT FROM man.format;
$$;

GRANT EXECUTE ON FUNCTION public.get_group_capacity_counts() TO anon, authenticated;