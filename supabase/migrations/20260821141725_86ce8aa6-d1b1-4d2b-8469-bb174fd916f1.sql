CREATE TABLE public.resource_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  resource TEXT NOT NULL DEFAULT 'arabizi-cheat-sheet',
  consent BOOLEAN NOT NULL DEFAULT false,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX resource_leads_email_idx ON public.resource_leads (lower(email));

GRANT ALL ON public.resource_leads TO service_role;

ALTER TABLE public.resource_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages resource leads"
ON public.resource_leads FOR ALL
TO service_role
USING (true) WITH CHECK (true);