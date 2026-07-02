CREATE TABLE public.rate_limit_events (
  id bigserial PRIMARY KEY,
  bucket text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rate_limit_events_bucket_created_idx
  ON public.rate_limit_events (bucket, created_at);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_and_record_rate_limit(
  p_bucket text,
  p_max integer,
  p_window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.rate_limit_events WHERE created_at < now() - interval '24 hours';

  SELECT count(*) INTO v_count
  FROM public.rate_limit_events
  WHERE bucket = p_bucket
    AND created_at > now() - make_interval(secs => p_window_seconds);

  IF v_count >= p_max THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limit_events (bucket) VALUES (p_bucket);
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_and_record_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_record_rate_limit(text, integer, integer)
  TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_registration_rate_limit()
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
      'registration_insert:' || v_ip, 10, 3600
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
  END;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Too many registration attempts. Please try again later.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_registration_rate_limit ON public.registrations;
CREATE TRIGGER trg_registration_rate_limit
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_registration_rate_limit();