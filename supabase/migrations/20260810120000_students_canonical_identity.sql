-- Students: the canonical person identity required by spec_final.md §2 and
-- §3.1–3.4. Today a person who registers twice becomes two unrelated rows in
-- `registrations`, so there is no place to hang "one active enrolment",
-- duplicate detection, GDPR anonymisation or student history.
--
-- This migration is STRICTLY ADDITIVE and idempotent:
--   * creates public.students
--   * adds a NULLABLE student_id to registrations and bookings
--   * backfills students from existing rows
-- Nothing is dropped, no column is removed, no row is deleted, and every
-- existing query keeps working because student_id is optional. Linking is
-- introduced here; enforcing the spec's behavioural rules (one active
-- enrolment, seat reservation semantics, waiting list, refund tiers) is
-- deliberately NOT part of this migration.

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  -- Normalised forms used only for duplicate detection (spec §3.3).
  email_norm text GENERATED ALWAYS AS (nullif(lower(btrim(email)), '')) STORED,
  phone_norm text GENERATED ALWAYS AS (
    nullif(right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 9), '')
  ) STORED,
  preferred_language text CHECK (preferred_language IN ('ro', 'en') OR preferred_language IS NULL),
  marketing_consent boolean NOT NULL DEFAULT false,
  marketing_consent_at timestamptz,
  -- spec §3.6. Kept as a plain text status: business events drive it later.
  status text NOT NULL DEFAULT 'lead'
    CHECK (status IN ('lead', 'registered', 'active', 'completed', 'inactive')),
  notes text,
  -- spec §3.7 / §3.16: anonymise, never hard-delete.
  anonymized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- A student record with no contact information is invalid (spec §3.4).
  CONSTRAINT students_needs_contact CHECK (
    anonymized_at IS NOT NULL OR email IS NOT NULL OR phone IS NOT NULL
  )
);

-- Duplicate detection (spec §3.3): email first, then phone. Partial uniques so
-- anonymised records never block a new person reusing an address.
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email_norm
  ON public.students (email_norm) WHERE email_norm IS NOT NULL AND anonymized_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_phone_norm
  ON public.students (phone_norm) WHERE phone_norm IS NOT NULL AND anonymized_at IS NULL;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Students hold personal data: no anon/authenticated access at all. Only the
-- service role (admin edge functions) may read or write, matching the fact
-- that Version 1.0 has no student logins (spec §3.13).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'students'
      AND policyname = 'Service role manages students'
  ) THEN
    CREATE POLICY "Service role manages students"
      ON public.students FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Optional link from the existing transactional rows. NULL means "not yet
-- attributed", which is why nothing breaks for code that ignores it.
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES public.students(id) ON DELETE SET NULL;
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES public.students(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_student ON public.registrations (student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON public.bookings (student_id);

-- Backfill. Email is the stronger key, so it runs first; phone-only rows are
-- folded in afterwards. DISTINCT ON keeps the earliest row per person so the
-- student's created_at reflects first contact.
INSERT INTO public.students (full_name, email, phone, created_at)
SELECT DISTINCT ON (lower(btrim(r.email)))
       coalesce(r.name, ''), btrim(r.email), r.phone, r.created_at
FROM public.registrations r
WHERE r.email IS NOT NULL AND btrim(r.email) <> '' AND r.anonymized_at IS NULL
ORDER BY lower(btrim(r.email)), r.created_at
ON CONFLICT DO NOTHING;

INSERT INTO public.students (full_name, email, phone, created_at)
SELECT DISTINCT ON (right(regexp_replace(r.phone, '\D', '', 'g'), 9))
       coalesce(r.name, ''), NULL, r.phone, r.created_at
FROM public.registrations r
WHERE r.anonymized_at IS NULL
  AND (r.email IS NULL OR btrim(r.email) = '')
  AND r.phone IS NOT NULL
  AND right(regexp_replace(r.phone, '\D', '', 'g'), 9) <> ''
ORDER BY right(regexp_replace(r.phone, '\D', '', 'g'), 9), r.created_at
ON CONFLICT DO NOTHING;

-- Attribute existing rows to the students just created (only where unset).
UPDATE public.registrations r
SET student_id = s.id
FROM public.students s
WHERE r.student_id IS NULL
  AND s.email_norm IS NOT NULL
  AND s.email_norm = nullif(lower(btrim(r.email)), '');

UPDATE public.registrations r
SET student_id = s.id
FROM public.students s
WHERE r.student_id IS NULL
  AND s.phone_norm IS NOT NULL
  AND s.phone_norm = nullif(right(regexp_replace(coalesce(r.phone, ''), '\D', '', 'g'), 9), '');

UPDATE public.bookings b
SET student_id = s.id
FROM public.students s
WHERE b.student_id IS NULL
  AND s.email_norm IS NOT NULL
  AND s.email_norm = nullif(lower(btrim(b.student_email)), '');

COMMENT ON TABLE public.students IS
  'Canonical person identity (spec_final.md §2, §3.1-3.4). Linked optionally from registrations/bookings via student_id. Behavioural rules (one active enrolment, waiting list, refund tiers) are NOT enforced yet.';
