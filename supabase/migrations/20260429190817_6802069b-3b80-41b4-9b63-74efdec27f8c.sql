ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS lead_status text NOT NULL DEFAULT 'new';

ALTER TABLE public.registrations
DROP CONSTRAINT IF EXISTS registrations_lead_status_check;

ALTER TABLE public.registrations
ADD CONSTRAINT registrations_lead_status_check
CHECK (lead_status IN ('new', 'contacted', 'confirmed'));

CREATE INDEX IF NOT EXISTS registrations_lead_status_idx
ON public.registrations (lead_status);