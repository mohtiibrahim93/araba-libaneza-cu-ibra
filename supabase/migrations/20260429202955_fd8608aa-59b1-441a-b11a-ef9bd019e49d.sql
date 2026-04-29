CREATE TABLE public.email_confirmation_settings (
  id integer PRIMARY KEY DEFAULT 1,
  sender_name text NOT NULL DEFAULT 'Arabă Libaneză cu Ibra',
  sender_email text NOT NULL DEFAULT 'noreply@arabalibanezacuibra.ro',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_confirmation_settings_singleton CHECK (id = 1),
  CONSTRAINT email_confirmation_sender_name_length CHECK (char_length(trim(sender_name)) BETWEEN 2 AND 80),
  CONSTRAINT email_confirmation_sender_email_format CHECK (sender_email ~* '^[A-Z0-9._%+-]+@(arabalibanezacuibra\.ro|notify\.arabalibanezacuibra\.ro)$')
);

ALTER TABLE public.email_confirmation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage email confirmation settings"
ON public.email_confirmation_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

INSERT INTO public.email_confirmation_settings (id, sender_name, sender_email)
VALUES (1, 'Arabă Libaneză cu Ibra', 'noreply@arabalibanezacuibra.ro')
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.set_email_confirmation_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_email_confirmation_settings_updated_at
BEFORE UPDATE ON public.email_confirmation_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_email_confirmation_settings_updated_at();