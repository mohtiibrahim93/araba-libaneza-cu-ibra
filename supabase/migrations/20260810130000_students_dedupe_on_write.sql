-- Dedupe-on-write: every new registration/booking is attributed to a canonical
-- student, creating one only when no existing record matches (spec §3.2-§3.3).
--
-- Implemented as a database trigger rather than application code on purpose:
--   * public.students is service-role only, so the anon client that inserts
--     registrations from the website could never write it directly;
--   * a trigger covers EVERY path at once — website form, trial page, admin
--     manual signups, edge functions and future imports — instead of each
--     insert site having to remember;
--   * it stays correct even if a new insert path is added later.
--
-- Additive and idempotent. The trigger only ever fills student_id when it is
-- NULL and never modifies the registration's own data.

CREATE OR REPLACE FUNCTION public.find_or_create_student(
  p_name text,
  p_email text,
  p_phone text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_norm text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_phone_norm text := nullif(right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 9), '');
  v_id uuid;
BEGIN
  -- No contact information at all: a student record would be invalid (§3.4).
  IF v_email_norm IS NULL AND v_phone_norm IS NULL THEN
    RETURN NULL;
  END IF;

  -- Priority 1: exact email, case-insensitive.
  IF v_email_norm IS NOT NULL THEN
    SELECT id INTO v_id FROM public.students
    WHERE email_norm = v_email_norm AND anonymized_at IS NULL
    LIMIT 1;
  END IF;

  -- Priority 2: normalised phone.
  IF v_id IS NULL AND v_phone_norm IS NOT NULL THEN
    SELECT id INTO v_id FROM public.students
    WHERE phone_norm = v_phone_norm AND anonymized_at IS NULL
    LIMIT 1;
  END IF;

  IF v_id IS NOT NULL THEN
    -- Enrich an existing record with contact details it was missing, but never
    -- overwrite what is already there: the system must never merge or silently
    -- rewrite student identities (§3.3).
    UPDATE public.students
    SET email = coalesce(email, nullif(btrim(p_email), '')),
        phone = coalesce(phone, nullif(btrim(p_phone), '')),
        full_name = CASE
          WHEN coalesce(btrim(full_name), '') = '' THEN coalesce(btrim(p_name), '')
          ELSE full_name
        END
    WHERE id = v_id;
    RETURN v_id;
  END IF;

  INSERT INTO public.students (full_name, email, phone)
  VALUES (coalesce(btrim(p_name), ''), nullif(btrim(p_email), ''), nullif(btrim(p_phone), ''))
  RETURNING id INTO v_id;

  RETURN v_id;
EXCEPTION
  -- A concurrent insert won the unique index: re-read instead of failing the
  -- registration. Attribution must never block a paying customer.
  WHEN unique_violation THEN
    SELECT id INTO v_id FROM public.students
    WHERE (v_email_norm IS NOT NULL AND email_norm = v_email_norm)
       OR (v_phone_norm IS NOT NULL AND phone_norm = v_phone_norm)
    LIMIT 1;
    RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_registrations_attach_student()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.student_id IS NULL THEN
    NEW.student_id := public.find_or_create_student(NEW.name, NEW.email, NEW.phone);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_bookings_attach_student()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.student_id IS NULL THEN
    NEW.student_id := public.find_or_create_student(
      NEW.student_name, NEW.student_email, NEW.student_phone
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_registrations_attach_student ON public.registrations;
CREATE TRIGGER trg_registrations_attach_student
  BEFORE INSERT ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.tg_registrations_attach_student();

DROP TRIGGER IF EXISTS trg_bookings_attach_student ON public.bookings;
CREATE TRIGGER trg_bookings_attach_student
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.tg_bookings_attach_student();

COMMENT ON FUNCTION public.find_or_create_student IS
  'Duplicate detection per spec_final.md §3.3: email (case-insensitive) then normalised phone. Never merges existing students; only fills missing contact fields.';
