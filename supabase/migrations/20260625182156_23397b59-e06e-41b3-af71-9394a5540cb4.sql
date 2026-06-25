
-- 1. Gated cohort signup counts (qualified + converted only)
CREATE OR REPLACE FUNCTION public.get_cohort_signup_counts()
RETURNS TABLE(cohort_id uuid, taken bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT cohort_id, count(*)::bigint
  FROM public.registrations
  WHERE cohort_id IS NOT NULL
    AND lead_status IN ('qualified','converted')
  GROUP BY cohort_id;
$$;

-- 2. Gated kids slot signup counts
CREATE OR REPLACE FUNCTION public.get_kids_slot_signup_counts()
RETURNS TABLE(kids_slot_id uuid, taken bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT kids_slot_id, count(*)::bigint
  FROM public.registrations
  WHERE kids_slot_id IS NOT NULL
    AND lead_status IN ('qualified','converted')
  GROUP BY kids_slot_id;
$$;

-- 3. New per-(form_type, level) capacity counter, gated
CREATE OR REPLACE FUNCTION public.get_group_capacity_counts()
RETURNS TABLE(form_type text, level text, taken bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT form_type, level, count(*)::bigint
  FROM public.registrations
  WHERE form_type IN ('group','kids')
    AND lead_status IN ('qualified','converted')
  GROUP BY form_type, level;
$$;

GRANT EXECUTE ON FUNCTION public.get_group_capacity_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_cohort_signup_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_kids_slot_signup_counts() TO anon, authenticated;

-- 4. Backfill cohort status from is_active
UPDATE public.group_cohorts
SET status = CASE
  WHEN is_active THEN 'forming'
  ELSE 'cancelled'
END
WHERE status = 'draft';

-- 5. Dual-write trigger: keep is_active and status in sync
CREATE OR REPLACE FUNCTION public.sync_cohort_status_is_active()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- If status changed, derive is_active
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.is_active := NEW.status IN ('forming','minimum_reached','confirmed','full','in_progress');
  -- Else if is_active changed, derive a sensible status
  ELSIF TG_OP = 'UPDATE' AND NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    IF NEW.is_active AND OLD.status IN ('draft','cancelled','completed') THEN
      NEW.status := 'forming';
    ELSIF NOT NEW.is_active AND OLD.status IN ('forming','minimum_reached','confirmed','full','in_progress') THEN
      NEW.status := 'cancelled';
    END IF;
  -- On insert: derive whichever side was left at default
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.status = 'draft' AND NEW.is_active THEN
      NEW.status := 'forming';
    ELSIF NOT NEW.is_active AND NEW.status NOT IN ('cancelled','completed') THEN
      NEW.status := 'cancelled';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_cohort_status_is_active ON public.group_cohorts;
CREATE TRIGGER trg_sync_cohort_status_is_active
BEFORE INSERT OR UPDATE ON public.group_cohorts
FOR EACH ROW EXECUTE FUNCTION public.sync_cohort_status_is_active();
