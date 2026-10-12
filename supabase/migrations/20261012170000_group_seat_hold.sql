-- Hold a group seat while its payment is open.
--
-- Until now a seat counted only once paid (or accepted by the owner), so two
-- people who both opened payment for the last seat could both pay. Now opening
-- payment holds the seat for 30 minutes: a held seat counts as taken for
-- everyone else (the public picker, the registration check and other payments)
-- and simply stops counting when it expires. A successful payment converts the
-- registration, which counts it for good. No cron is needed.

ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS seat_hold_until timestamptz;

-- One definition of "seats taken", used by the public counts, the registration
-- trigger and the hold. p_exclude leaves the caller's own hold out.
CREATE OR REPLACE FUNCTION public.cohort_seats_taken(p_cohort uuid, p_exclude uuid DEFAULT NULL)
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (SELECT count(*) FROM public.registrations r
      WHERE r.cohort_id = p_cohort
        AND (r.lead_status IN ('qualified','converted')
             OR (r.seat_hold_until > now() AND r.id IS DISTINCT FROM p_exclude)))
    + coalesce((SELECT c.manual_offset FROM public.group_cohorts c WHERE c.id = p_cohort), 0)
    + coalesce((SELECT sum(m.count) FROM public.manual_signups m WHERE m.cohort_id = p_cohort), 0);
$$;
REVOKE ALL ON FUNCTION public.cohort_seats_taken(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cohort_seats_taken(uuid, uuid) TO service_role;

-- Public counts now include active holds, so a seat being paid for shows as taken.
CREATE OR REPLACE FUNCTION public.get_cohort_signup_counts()
RETURNS TABLE(cohort_id uuid, taken bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id AS cohort_id, public.cohort_seats_taken(c.id)::bigint AS taken FROM public.group_cohorts c;
$$;
GRANT EXECUTE ON FUNCTION public.get_cohort_signup_counts() TO anon, authenticated;

-- Reserve a seat for a registration about to pay. Returns false when the group
-- is full. The cohort row is locked, so two last-seat payments are decided one
-- after the other. A student already holding a seat (accepted or paid) passes.
CREATE OR REPLACE FUNCTION public.hold_group_seat(p_registration uuid, p_minutes integer DEFAULT 30)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.registrations%ROWTYPE; c public.group_cohorts%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.registrations WHERE id = p_registration;
  IF NOT FOUND OR r.cohort_id IS NULL THEN RETURN false; END IF;
  IF r.lead_status IN ('qualified','converted') THEN RETURN true; END IF;
  SELECT * INTO c FROM public.group_cohorts WHERE id = r.cohort_id FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF c.max_seats IS NOT NULL AND public.cohort_seats_taken(c.id, r.id) >= c.max_seats THEN RETURN false; END IF;
  UPDATE public.registrations
     SET seat_hold_until = now() + make_interval(mins => greatest(1, least(coalesce(p_minutes, 30), 120)))
   WHERE id = r.id;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.hold_group_seat(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hold_group_seat(uuid, integer) TO service_role;

-- The public registration check counts held seats too.
CREATE OR REPLACE FUNCTION public.require_public_registration_group()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.group_cohorts%ROWTYPE;
BEGIN
  IF NEW.form_type <> 'group' OR coalesce(auth.role(), '') = 'service_role' THEN RETURN NEW; END IF;
  IF NEW.cohort_id IS NULL THEN RAISE EXCEPTION 'Choose a group before continuing' USING ERRCODE = '23514'; END IF;
  SELECT * INTO c FROM public.group_cohorts WHERE id = NEW.cohort_id FOR UPDATE;
  IF NOT FOUND OR c.is_active IS NOT TRUE OR c.form_type <> 'group' OR c.level IS DISTINCT FROM NEW.level
     OR (c.format IS NOT NULL AND c.format IS DISTINCT FROM NEW.format)
     OR c.status NOT IN ('forming','minimum_reached','confirmed') THEN
    RAISE EXCEPTION 'The selected group is unavailable or does not match the course' USING ERRCODE = '23514';
  END IF;
  IF c.max_seats IS NOT NULL AND public.cohort_seats_taken(c.id) >= c.max_seats THEN
    RAISE EXCEPTION 'group_full: The selected group is full' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.require_public_registration_group() FROM PUBLIC, anon, authenticated;
