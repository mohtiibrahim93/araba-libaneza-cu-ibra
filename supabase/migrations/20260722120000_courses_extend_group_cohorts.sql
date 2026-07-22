-- Phase 1 of the Cursuri redesign: extend group_cohorts into the full "course"
-- model that drives the new age → modality → type → individual-course flow,
-- managed entirely from the admin.
--
-- Design note: we EXTEND the existing group_cohorts table rather than create a
-- parallel "courses" table, so seat counts, the public picker and registration
-- keep working off one source of truth (no duplication). This migration is
-- purely additive and idempotent — every existing cohort keeps functioning and
-- gets a sensible backfill. Safe to re-run.

-- New structured/filterable columns.
ALTER TABLE public.group_cohorts
  -- Age band so Adulți / Adolescenți / Copii filter independently. (form_type
  -- still distinguishes the group vs kids *registration flow*.)
  ADD COLUMN IF NOT EXISTS age_category text,
  -- Grup vs Privat. Existing rows are all group courses. Private lessons stay
  -- form-driven (no per-course rows), but the column future-proofs filtering.
  ADD COLUMN IF NOT EXISTS course_type text NOT NULL DEFAULT 'grup',
  -- Stable slug for the per-course page /cursuri/curs/:slug.
  ADD COLUMN IF NOT EXISTS slug text,
  -- Course title (falls back to the level-derived title when null).
  ADD COLUMN IF NOT EXISTS title_ro text,
  ADD COLUMN IF NOT EXISTS title_en text,
  -- Per-course price in LEI (falls back to the computed price by level/format).
  ADD COLUMN IF NOT EXISTS price_lei integer,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS session_count integer,
  ADD COLUMN IF NOT EXISTS total_hours integer,
  ADD COLUMN IF NOT EXISTS image_url text,
  -- Rich bilingual prose kept as JSONB so the owner can edit copy without
  -- migrations: { short_ro, short_en, long_ro, long_en, audience_ro/en,
  -- prerequisites_ro/en, objectives_ro/en, curriculum_ro/en, method_ro/en,
  -- materials_ro/en, teacher_ro/en, policies_ro/en, payment_ro/en,
  -- faq: [{ q_ro, q_en, a_ro, a_en }] }.
  ADD COLUMN IF NOT EXISTS content jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Backfill age_category from the existing registration flow: kids cohorts are
-- children; everything else is adults (owner can reassign teens in admin).
UPDATE public.group_cohorts
  SET age_category = CASE WHEN form_type = 'kids' THEN 'copii' ELSE 'adulti' END
  WHERE age_category IS NULL;

-- Value constraints (guarded so re-runs don't fail).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'group_cohorts_age_category_check') THEN
    ALTER TABLE public.group_cohorts
      ADD CONSTRAINT group_cohorts_age_category_check
      CHECK (age_category IS NULL OR age_category IN ('adulti','adolescenti','copii'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'group_cohorts_course_type_check') THEN
    ALTER TABLE public.group_cohorts
      ADD CONSTRAINT group_cohorts_course_type_check
      CHECK (course_type IN ('grup','privat'));
  END IF;
END $$;

-- One slug per course (nulls allowed until the owner names it).
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_cohorts_slug
  ON public.group_cohorts (slug) WHERE slug IS NOT NULL;

-- Public listing/filter path: age + type + format + status, active only.
CREATE INDEX IF NOT EXISTS idx_group_cohorts_age_type_format
  ON public.group_cohorts (age_category, course_type, format, status)
  WHERE is_active = true;
