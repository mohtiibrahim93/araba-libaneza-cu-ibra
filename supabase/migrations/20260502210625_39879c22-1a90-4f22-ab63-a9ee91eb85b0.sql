ALTER TABLE public.email_confirmation_settings DROP CONSTRAINT IF EXISTS email_confirmation_sender_email_format;

UPDATE public.email_confirmation_settings
  SET sender_email = 'noreply@centruldearabalibaneza.com'
  WHERE sender_email !~* '^[A-Z0-9._%+-]+@(centruldearabalibaneza\.com|notify\.centruldearabalibaneza\.com)$';

ALTER TABLE public.email_confirmation_settings
  ADD CONSTRAINT email_confirmation_sender_email_format
  CHECK (sender_email ~* '^[A-Z0-9._%+-]+@(centruldearabalibaneza\.com|notify\.centruldearabalibaneza\.com)$');

ALTER TABLE public.email_confirmation_settings
  ALTER COLUMN sender_email SET DEFAULT 'noreply@centruldearabalibaneza.com';