-- Add level + waitlist deposit tracking to registrations
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS is_waitlist_deposit boolean NOT NULL DEFAULT false;

-- Group capacities table (admin-configurable)
CREATE TABLE IF NOT EXISTS public.group_capacities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL,
  level text,
  max_seats integer NOT NULL DEFAULT 10,
  min_seats integer NOT NULL DEFAULT 4,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (form_type, level)
);

-- Treat NULL as a value for uniqueness on (form_type, level) so kids row is unique
CREATE UNIQUE INDEX IF NOT EXISTS group_capacities_form_level_null_idx
  ON public.group_capacities (form_type, COALESCE(level, ''));

ALTER TABLE public.group_capacities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read capacities" ON public.group_capacities;
CREATE POLICY "Anyone can read capacities"
  ON public.group_capacities
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role can manage capacities" ON public.group_capacities;
CREATE POLICY "Service role can manage capacities"
  ON public.group_capacities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed defaults: group A1..C2 (10/4) + kids (10/4)
INSERT INTO public.group_capacities (form_type, level, max_seats, min_seats) VALUES
  ('group', 'A1', 10, 4),
  ('group', 'A2', 10, 4),
  ('group', 'B1', 10, 4),
  ('group', 'B2', 10, 4),
  ('group', 'C1', 10, 4),
  ('group', 'C2', 10, 4),
  ('kids', NULL, 10, 4)
ON CONFLICT DO NOTHING;