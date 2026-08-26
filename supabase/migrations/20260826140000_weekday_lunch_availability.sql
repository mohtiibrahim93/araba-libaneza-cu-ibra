-- Weekday lunch window: Monday to Friday, 12:00-13:00.
--
-- Once both in-person cohorts run, Monday to Thursday 19:00-20:30 is teaching
-- time, so the collision guard removes every weekday evening slot and trials
-- collapse to Friday evening plus the weekend — nothing at all for someone who
-- can only manage a weekday. Measured on a fully-running week: Mon-Thu 0
-- bookable slots, Fri 3, Sat 11, Sun 14.
--
-- The owner teaches over the midday break, which this window opens up:
--   trial  (30 min) -> 12:00 and 12:30
--   paid   (60 min) -> 12:00
--
-- The existing 19:00-20:30 weekday rules stay exactly as they are. Friday is
-- the only free evening once cohorts start, and the guard already withholds
-- Monday to Thursday on its own — no rule needs to encode which days those
-- are, so this keeps working if a cohort moves.
--
-- Weekends are unchanged and already correct: Saturday's class is 12:00-13:30
-- with the 10:00-18:00 window leaving time before and after it, and Sunday's
-- is 17:30-19:00, where the guard withholds 17:00 onwards so nothing can be
-- booked after it starts.
--
-- Additive: one new window per weekday, no existing row touched.

INSERT INTO public.availability_rules (weekday, start_time, end_time, is_active)
SELECT v.weekday, '12:00'::time, '13:00'::time, true
FROM (VALUES (1), (2), (3), (4), (5)) AS v(weekday)
WHERE NOT EXISTS (
  SELECT 1 FROM public.availability_rules r
  WHERE r.weekday = v.weekday
    AND r.start_time = '12:00'::time
    AND r.end_time = '13:00'::time
);
