-- Link every booking to a registration. Orphans are deleted (per product spec).
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS registration_id UUID;

-- Backfill: latest registration with matching email (case-insensitive).
UPDATE public.bookings b
SET registration_id = r.id
FROM (
  SELECT DISTINCT ON (lower(email)) id, lower(email) AS email_lc
  FROM public.registrations
  WHERE email IS NOT NULL AND email <> ''
  ORDER BY lower(email), created_at DESC
) r
WHERE r.email_lc = lower(b.student_email)
  AND b.registration_id IS NULL;

-- Remove orphan bookings (no matching registration).
DELETE FROM public.bookings WHERE registration_id IS NULL;

ALTER TABLE public.bookings
  ALTER COLUMN registration_id SET NOT NULL;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_registration_id_fkey
    FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_bookings_registration_id
  ON public.bookings (registration_id);