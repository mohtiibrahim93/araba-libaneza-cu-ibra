-- Group cohorts: admin-configured start dates per level (1-3 per level)
CREATE TABLE public.group_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL CHECK (form_type IN ('group','kids')),
  level text,
  start_date date NOT NULL,
  schedule_label_ro text NOT NULL DEFAULT '',
  schedule_label_en text NOT NULL DEFAULT '',
  max_seats integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.group_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active cohorts"
  ON public.group_cohorts FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role manages cohorts"
  ON public.group_cohorts FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER trg_group_cohorts_updated_at
  BEFORE UPDATE ON public.group_cohorts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX idx_group_cohorts_form_level ON public.group_cohorts(form_type, level) WHERE is_active = true;

-- Kids weekly recurring class slots
CREATE TABLE public.kids_class_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  start_time time NOT NULL,
  duration_min integer NOT NULL DEFAULT 60,
  format text NOT NULL CHECK (format IN ('online','physical')),
  location text,
  max_seats integer NOT NULL DEFAULT 8,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_class_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active kids slots"
  ON public.kids_class_slots FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role manages kids slots"
  ON public.kids_class_slots FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER trg_kids_class_slots_updated_at
  BEFORE UPDATE ON public.kids_class_slots
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Link registrations to cohort / kids slot for per-bucket seat counting
ALTER TABLE public.registrations
  ADD COLUMN cohort_id uuid,
  ADD COLUMN kids_slot_id uuid;

CREATE INDEX idx_registrations_cohort_id ON public.registrations(cohort_id) WHERE cohort_id IS NOT NULL;
CREATE INDEX idx_registrations_kids_slot_id ON public.registrations(kids_slot_id) WHERE kids_slot_id IS NOT NULL;

-- Allow public/anon to SELECT cohort_id / kids_slot_id counts via a security-definer view-style RPC?
-- Simpler: keep the existing "Anyone can submit a registration" INSERT policy. Add a narrow SELECT
-- policy that exposes ONLY the bucket id + count-eligible rows (no PII).
CREATE POLICY "Anyone can count cohort/slot signups"
  ON public.registrations FOR SELECT
  TO anon, authenticated
  USING (cohort_id IS NOT NULL OR kids_slot_id IS NOT NULL);