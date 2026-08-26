-- Per-day meeting times for a cohort.
--
-- group_cohorts carries a single start_time/end_time, which cannot express a
-- group that meets at different hours on different days. A1 online does
-- exactly that: Saturday 12:00-13:30 and Sunday 17:30-19:00. Stored as one
-- pair, Sunday was wrong in the database and wrong in the public schedule
-- label visitors read.
--
-- This matters beyond display: booking-availability treats cohort lesson times
-- as busy so a trial or private lesson is never sold on top of a live class.
-- With the wrong Sunday hours it blocked 11:30-13:30 (nothing is happening
-- then) and left 17:00-17:30 open (a class is running).
--
-- Additive. group_cohorts keeps its columns and every cohort without rows here
-- continues to use them, so nothing that reads the old shape changes.

CREATE TABLE IF NOT EXISTS public.cohort_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.group_cohorts(id) ON DELETE CASCADE,
  -- 0 = Sunday .. 6 = Saturday, the convention availability_rules.weekday and
  -- weekdayInTz() already use.
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cohort_meetings_time_order CHECK (end_time > start_time),
  CONSTRAINT cohort_meetings_unique_slot UNIQUE (cohort_id, weekday, start_time)
);

CREATE INDEX IF NOT EXISTS idx_cohort_meetings_cohort ON public.cohort_meetings (cohort_id);

ALTER TABLE public.cohort_meetings ENABLE ROW LEVEL SECURITY;

-- Mirrors group_cohorts' own policy: the schedule of an active cohort is
-- public information — it is printed on the course pages.
DROP POLICY IF EXISTS "Anyone can read meetings of active cohorts" ON public.cohort_meetings;
CREATE POLICY "Anyone can read meetings of active cohorts"
  ON public.cohort_meetings FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.group_cohorts g
    WHERE g.id = cohort_meetings.cohort_id AND g.is_active = true
  ));

DROP POLICY IF EXISTS "Service role manages cohort meetings" ON public.cohort_meetings;
CREATE POLICY "Service role manages cohort meetings"
  ON public.cohort_meetings FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Seed from the owner-confirmed schedules.
INSERT INTO public.cohort_meetings (cohort_id, weekday, start_time, end_time)
SELECT g.id, v.weekday, v.start_time, v.end_time
FROM public.group_cohorts g
JOIN (VALUES
  -- A1 fizic (Grupa 2): Luni & Miercuri 19:00-20:30
  ('A1', 'fizic',  1, '19:00'::time, '20:30'::time),
  ('A1', 'fizic',  3, '19:00'::time, '20:30'::time),
  -- A2 fizic: Marti & Joi 19:00-20:30
  ('A2', 'fizic',  2, '19:00'::time, '20:30'::time),
  ('A2', 'fizic',  4, '19:00'::time, '20:30'::time),
  -- A1 online: Sambata 12:00-13:30, Duminica 17:30-19:00 (the two differ)
  ('A1', 'online', 6, '12:00'::time, '13:30'::time),
  ('A1', 'online', 0, '17:30'::time, '19:00'::time)
) AS v(level, format, weekday, start_time, end_time)
  ON v.level = g.level AND v.format = g.format
WHERE g.is_active = true
ON CONFLICT ON CONSTRAINT cohort_meetings_unique_slot DO NOTHING;

-- The public label said "Sâmbătă & Duminică la 12:00", which is wrong for
-- Sunday. Spell both days out.
UPDATE public.group_cohorts
SET schedule_label_ro = 'Sâmbătă 12:00–13:30 & Duminică 17:30–19:00',
    schedule_label_en = 'Saturday 12:00–13:30 & Sunday 17:30–19:00'
WHERE level = 'A1' AND format = 'online';

COMMENT ON TABLE public.cohort_meetings IS
  'Per-weekday lesson times for a cohort, for groups whose days differ. Read by booking-availability so a trial is never offered while a class is running. A cohort with no rows here falls back to group_cohorts.days_of_week + start_time/end_time.';
