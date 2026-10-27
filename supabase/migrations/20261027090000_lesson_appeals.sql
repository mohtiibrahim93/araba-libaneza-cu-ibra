-- A student can contest a package lesson counted as lost (no-show or late
-- cancellation) from their lesson page; the owner answers within 24 hours
-- with Scuzat (does not count) or Pierdută (counts). Owner's rule,
-- 26 October 2026. One appeal per lesson.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS appeal_text text,
  ADD COLUMN IF NOT EXISTS appeal_at timestamptz,
  ADD COLUMN IF NOT EXISTS appeal_decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS appeal_decision text
    CHECK (appeal_decision IS NULL OR appeal_decision IN ('excused', 'lost'));

CREATE INDEX IF NOT EXISTS bookings_open_appeals_idx
  ON public.bookings (appeal_at)
  WHERE appeal_at IS NOT NULL AND appeal_decided_at IS NULL;
