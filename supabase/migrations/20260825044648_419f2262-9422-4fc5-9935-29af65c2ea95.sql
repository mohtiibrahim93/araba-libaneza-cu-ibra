ALTER TABLE public.email_send_log ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE INDEX IF NOT EXISTS idx_email_send_log_idempotency_key
  ON public.email_send_log (idempotency_key);