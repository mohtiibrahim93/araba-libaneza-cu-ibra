-- Rate limiting: nothing on this project inbound-throttled registration
-- inserts, and the open "Anyone can submit a registration" INSERT policy
-- means an attacker can mint unlimited free registration IDs, then chain
-- them into booking-create (which sends real transactional email to a
-- client-supplied address with no auth/CAPTCHA/rate-limit) to relay spam.
-- This closes the registration-minting side of that chain.
CREATE TABLE public.rate_limit_events (
  id bigserial PRIMARY KEY,
  bucket text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rate_limit_events_bucket_created_idx
  ON public.rate_limit_events (bucket, created_at);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: only the SECURITY DEFINER function
-- below (and service_role, which bypasses RLS) can touch this table.

-- Returns true and records the attempt if `bucket` is under `p_max` events
-- within the trailing `p_window_seconds`; returns false without recording
-- if already at the limit. SECURITY DEFINER so callers don't need direct
-- table grants.
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
  -- Opportunistic cleanup so this table doesn't grow unbounded. Cheap
  -- no-op most of the time; only deletes rows well outside any window
  -- we use (24h is comfortably above the 1h windows configured today).
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

-- Trigger: caps registration inserts per client IP. Deliberately fails
-- OPEN (allows the insert) on any error extracting/parsing the IP, or any
-- unexpected error in the rate-limit check itself — registrations are the
-- core conversion action on this site, and a bug in this trigger must
-- never be able to block a real signup.
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
    RETURN NEW; -- can't identify caller — fail open, no limit possible
  END IF;

  BEGIN
    v_allowed := public.check_and_record_rate_limit(
      'registration_insert:' || v_ip, 10, 3600
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN NEW; -- rate-limit check itself failed — fail open
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
