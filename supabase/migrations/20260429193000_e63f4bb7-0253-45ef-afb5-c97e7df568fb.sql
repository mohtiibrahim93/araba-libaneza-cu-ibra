CREATE TABLE public.lead_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT lead_status_history_new_status_check CHECK (new_status IN ('new', 'contacted', 'confirmed')),
  CONSTRAINT lead_status_history_previous_status_check CHECK (previous_status IS NULL OR previous_status IN ('new', 'contacted', 'confirmed'))
);

ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can read lead status history"
ON public.lead_status_history
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert lead status history"
ON public.lead_status_history
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_lead_status_history_registration_id_created_at
ON public.lead_status_history (registration_id, created_at DESC);