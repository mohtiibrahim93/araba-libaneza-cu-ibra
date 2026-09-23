CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  language text NOT NULL DEFAULT 'ro',
  source text NOT NULL DEFAULT 'contact_page',
  handled_at timestamp with time zone,
  CONSTRAINT contact_messages_name_len CHECK (char_length(name) BETWEEN 2 AND 100),
  CONSTRAINT contact_messages_email_len CHECK (char_length(email) BETWEEN 5 AND 255),
  CONSTRAINT contact_messages_phone_len CHECK (phone IS NULL OR char_length(phone) <= 30),
  CONSTRAINT contact_messages_message_len CHECK (char_length(message) BETWEEN 5 AND 2000),
  CONSTRAINT contact_messages_language_chk CHECK (language IN ('ro','en'))
);

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a contact message"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (handled_at IS NULL AND source = 'contact_page');

CREATE OR REPLACE FUNCTION public.enforce_contact_message_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip text;
  v_allowed boolean;
BEGIN
  BEGIN
    v_ip := trim(split_part(
      coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''),
      ',', 1
    ));
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;

  IF v_ip IS NULL OR v_ip = '' THEN
    RETURN NEW;
  END IF;

  BEGIN
    v_allowed := public.check_and_record_rate_limit(
      'contact_message_insert:' || v_ip, 5, 3600
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
  END;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Too many messages. Please try again later.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contact_message_rate_limit ON public.contact_messages;
CREATE TRIGGER trg_contact_message_rate_limit
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_contact_message_rate_limit();