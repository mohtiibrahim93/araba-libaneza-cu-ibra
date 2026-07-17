-- Add a format dimension to group cohorts so each level can have separate
-- online and in-person (fizic) cohorts, each with its own start date and
-- open/closed status. Kids cohorts keep format NULL.
--
-- Backward-compatible: existing cohorts get format = NULL, which the public
-- picker treats as "applies to both formats" until the owner sets it in admin.
-- Idempotent so it is safe to re-run.

ALTER TABLE public.group_cohorts
  ADD COLUMN IF NOT EXISTS format text;

-- Allow only the two group formats (or NULL). Guard the constraint add so a
-- re-run doesn't error on the already-present constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'group_cohorts_format_check'
  ) THEN
    ALTER TABLE public.group_cohorts
      ADD CONSTRAINT group_cohorts_format_check
      CHECK (format IS NULL OR format IN ('fizic','online'));
  END IF;
END $$;

-- The public lookup filters by form_type + level + status; format narrows it.
CREATE INDEX IF NOT EXISTS idx_group_cohorts_form_level_format
  ON public.group_cohorts (form_type, level, format)
  WHERE is_active = true;
