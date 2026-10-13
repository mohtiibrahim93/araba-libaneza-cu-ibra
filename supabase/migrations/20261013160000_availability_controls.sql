-- Owner's request (13 October 2026): every rule that decides which hours the
-- site offers is editable from Admin › Program › Disponibilitate. Until now
-- three of them were fixed in code.

-- 1. Hours for one lesson type. A rule with event_type_slug applies only to
--    that type; a type with rules of its own uses only those, the others use
--    the general rules (event_type_slug null). The level check's weekday
--    12:00–13:00 hour, fixed in code until now, becomes such rules.
ALTER TABLE public.availability_rules
  ADD COLUMN IF NOT EXISTS event_type_slug text REFERENCES public.booking_event_types(slug) ON DELETE CASCADE;
INSERT INTO public.availability_rules (weekday, start_time, end_time, is_active, event_type_slug)
SELECT d, '12:00', '13:00', true, 'verificare-nivel'
FROM generate_series(1, 5) AS d
WHERE EXISTS (SELECT 1 FROM public.booking_event_types WHERE slug = 'verificare-nivel')
  AND NOT EXISTS (SELECT 1 FROM public.availability_rules WHERE event_type_slug = 'verificare-nivel');

-- 2. The days a lesson type can be booked in person (0 = Sunday … 6 =
--    Saturday); null = any day. The in-person free trial stays weekends only.
ALTER TABLE public.booking_event_types ADD COLUMN IF NOT EXISTS physical_weekdays smallint[];
UPDATE public.booking_event_types SET physical_weekdays = '{0,6}' WHERE slug = 'trial' AND physical_weekdays IS NULL;

-- 3. Days off: nothing is offered on these dates (Romania's calendar date),
--    whatever the weekly hours say. Lessons already booked are not touched.
CREATE TABLE IF NOT EXISTS public.availability_blackouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  end_date date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_blackouts_range CHECK (end_date >= start_date)
);
ALTER TABLE public.availability_blackouts ENABLE ROW LEVEL SECURITY;
-- Read and written only by the edge functions (service role).
