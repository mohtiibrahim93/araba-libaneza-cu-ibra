-- Public group registrations may not be saved into a full group.
--
-- Until now only the browser hid a full group, so a stale page or two people
-- on the last seat could both register and pay. Seats are counted exactly as
-- get_cohort_signup_counts counts them (accepted or paid registrations, plus
-- manual signups and the manual offset). The cohort row is locked so two
-- concurrent inserts for the same group are checked one after the other.
-- Admin (service_role) arrangements stay exempt, as before.
CREATE OR REPLACE FUNCTION public.require_public_registration_group()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.group_cohorts%ROWTYPE; taken bigint;
BEGIN
  IF NEW.form_type <> 'group' OR coalesce(auth.role(), '') = 'service_role' THEN RETURN NEW; END IF;
  IF NEW.cohort_id IS NULL THEN RAISE EXCEPTION 'Choose a group before continuing' USING ERRCODE = '23514'; END IF;
  SELECT * INTO c FROM public.group_cohorts WHERE id = NEW.cohort_id FOR UPDATE;
  IF NOT FOUND OR c.is_active IS NOT TRUE OR c.form_type <> 'group' OR c.level IS DISTINCT FROM NEW.level
     OR (c.format IS NOT NULL AND c.format IS DISTINCT FROM NEW.format)
     OR c.status NOT IN ('forming','minimum_reached','confirmed') THEN
    RAISE EXCEPTION 'The selected group is unavailable or does not match the course' USING ERRCODE = '23514';
  END IF;
  SELECT (SELECT count(*) FROM public.registrations r
           WHERE r.cohort_id = c.id AND r.lead_status IN ('qualified','converted'))
       + coalesce(c.manual_offset, 0)
       + coalesce((SELECT sum(m.count) FROM public.manual_signups m WHERE m.cohort_id = c.id), 0)
    INTO taken;
  IF c.max_seats IS NOT NULL AND taken >= c.max_seats THEN
    RAISE EXCEPTION 'group_full: The selected group is full' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.require_public_registration_group() FROM PUBLIC, anon, authenticated;
