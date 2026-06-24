
-- Phase 1: statuses & data model (additive, reversible)

-- 1) Widen lead_status vocabulary (§10)
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_lead_status_check;
ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_lead_status_check
  CHECK (lead_status = ANY (ARRAY['new','contacted','qualified','no_response','not_suitable','spam','converted']));

ALTER TABLE public.lead_status_history DROP CONSTRAINT IF EXISTS lead_status_history_new_status_check;
ALTER TABLE public.lead_status_history DROP CONSTRAINT IF EXISTS lead_status_history_previous_status_check;
ALTER TABLE public.lead_status_history
  ADD CONSTRAINT lead_status_history_new_status_check
  CHECK (new_status = ANY (ARRAY['new','contacted','qualified','no_response','not_suitable','spam','converted']));
ALTER TABLE public.lead_status_history
  ADD CONSTRAINT lead_status_history_previous_status_check
  CHECK (previous_status IS NULL OR previous_status = ANY (ARRAY['new','contacted','qualified','no_response','not_suitable','spam','converted']));

-- 2) Source column on registrations (§30-31)
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'form';
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_source_check;
ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_source_check
  CHECK (source = ANY (ARRAY['form','whatsapp','admin']));
UPDATE public.registrations SET source = 'form' WHERE source IS NULL;

-- 3) Track preference on registrations + track on cohorts (§22)
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS track_preference text;
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_track_preference_check;
ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_track_preference_check
  CHECK (track_preference IS NULL OR track_preference = ANY (ARRAY['arabizi','arabic_script','not_sure']));

ALTER TABLE public.group_cohorts
  ADD COLUMN IF NOT EXISTS track text NOT NULL DEFAULT 'not_applicable';
ALTER TABLE public.group_cohorts DROP CONSTRAINT IF EXISTS group_cohorts_track_check;
ALTER TABLE public.group_cohorts
  ADD CONSTRAINT group_cohorts_track_check
  CHECK (track = ANY (ARRAY['arabizi','arabic_script','mixed','not_applicable']));

-- 4) Cohort status (§11). Table is empty; default 'draft'. Keep is_active for back-compat.
ALTER TABLE public.group_cohorts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';
ALTER TABLE public.group_cohorts DROP CONSTRAINT IF EXISTS group_cohorts_status_check;
ALTER TABLE public.group_cohorts
  ADD CONSTRAINT group_cohorts_status_check
  CHECK (status = ANY (ARRAY['draft','forming','minimum_reached','confirmed','full','in_progress','completed','cancelled']));

-- 5) Structured schedule fields on cohorts (§19)
ALTER TABLE public.group_cohorts
  ADD COLUMN IF NOT EXISTS days_of_week smallint[],
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS end_time time,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Europe/Bucharest',
  ADD COLUMN IF NOT EXISTS duration_minutes integer;

-- 6) Locations (§20)
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address_ro text NOT NULL,
  address_en text NOT NULL,
  city text NOT NULL,
  map_url text,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locations TO anon, authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active locations" ON public.locations;
CREATE POLICY "Public read active locations" ON public.locations
  FOR SELECT USING (active = true);
DROP TRIGGER IF EXISTS trg_locations_updated_at ON public.locations;
CREATE TRIGGER trg_locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.locations (name, address_ro, address_en, city, map_url)
SELECT 'Raduga Cultural Center', 'Strada Icoanei 80', 'Icoanei Street 80', 'București',
       'https://maps.google.com/?q=Raduga+Cultural+Center+Strada+Icoanei+80+Bucuresti'
WHERE NOT EXISTS (SELECT 1 FROM public.locations WHERE name = 'Raduga Cultural Center');

ALTER TABLE public.group_cohorts
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);

-- 7) Tutors (§17)
CREATE TABLE IF NOT EXISTS public.tutors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio_ro text,
  bio_en text,
  photo_url text,
  languages text[] NOT NULL DEFAULT ARRAY['ro','en','ar']::text[],
  available_formats text[] NOT NULL DEFAULT ARRAY['physical','online']::text[],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tutors TO anon, authenticated;
GRANT ALL ON public.tutors TO service_role;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active tutors" ON public.tutors;
CREATE POLICY "Public read active tutors" ON public.tutors
  FOR SELECT USING (active = true);
DROP TRIGGER IF EXISTS trg_tutors_updated_at ON public.tutors;
CREATE TRIGGER trg_tutors_updated_at BEFORE UPDATE ON public.tutors
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.tutors (name, bio_ro, bio_en)
SELECT 'Ibra',
       'Instructor de arabă libaneză, vorbitor nativ.',
       'Lebanese Arabic instructor, native speaker.'
WHERE NOT EXISTS (SELECT 1 FROM public.tutors WHERE name = 'Ibra');

ALTER TABLE public.group_cohorts
  ADD COLUMN IF NOT EXISTS tutor_id uuid REFERENCES public.tutors(id);

-- Default new cohorts to the seeded tutor
DO $$
DECLARE default_tutor uuid;
BEGIN
  SELECT id INTO default_tutor FROM public.tutors WHERE name = 'Ibra' LIMIT 1;
  IF default_tutor IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.group_cohorts ALTER COLUMN tutor_id SET DEFAULT %L', default_tutor);
  END IF;
END $$;

-- 8) Course requests (§53)
CREATE TABLE IF NOT EXISTS public.course_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  preferred_language text,
  level text,
  track text,
  preferred_days smallint[],
  preferred_time_block text,
  format text,
  location_preference text,
  lesson_type text,
  status text NOT NULL DEFAULT 'open',
  matched_cohort_id uuid REFERENCES public.group_cohorts(id),
  notes text,
  CONSTRAINT course_requests_status_check
    CHECK (status = ANY (ARRAY['open','grouped','converted','closed'])),
  CONSTRAINT course_requests_track_check
    CHECK (track IS NULL OR track = ANY (ARRAY['arabizi','arabic_script','not_sure'])),
  CONSTRAINT course_requests_format_check
    CHECK (format IS NULL OR format = ANY (ARRAY['physical','online','either'])),
  CONSTRAINT course_requests_lesson_type_check
    CHECK (lesson_type IS NULL OR lesson_type = ANY (ARRAY['group','private','kids']))
);
GRANT INSERT ON public.course_requests TO anon, authenticated;
GRANT ALL ON public.course_requests TO service_role;
ALTER TABLE public.course_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit a course request" ON public.course_requests;
CREATE POLICY "Anyone can submit a course request" ON public.course_requests
  FOR INSERT WITH CHECK (true);
DROP TRIGGER IF EXISTS trg_course_requests_updated_at ON public.course_requests;
CREATE TRIGGER trg_course_requests_updated_at BEFORE UPDATE ON public.course_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
