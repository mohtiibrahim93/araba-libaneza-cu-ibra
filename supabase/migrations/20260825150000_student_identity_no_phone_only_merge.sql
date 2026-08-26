-- Stop merging two people who share a phone number.
--
-- The previous rule matched on email OR normalised phone. Phone alone is not an
-- identity: a mother and her child enrolling on the same family number were
-- collapsed into one student record. This was observed in practice — two
-- registrations under different emails were attributed to a single student
-- purely because they carried the same number.
--
-- New rule, per the owner's decision:
--   1. same email                        -> same person
--   2. same phone AND same name (typos)  -> same person
--   3. otherwise                         -> a new student
--
-- So a family sharing one number now yields one student per person, while
-- "Yasmin Kourani" re-registering as "Yasmin Kurani" from the same number is
-- still recognised as the same person.
--
-- Non-destructive: no rows are deleted or merged, and no existing attribution
-- changes. Only the matching rule for FUTURE writes and the phone index change.

-- levenshtein() for the typo tolerance.
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA extensions;

-- A comparable form of a person's name: lowercase, without Romanian diacritics
-- or punctuation, whitespace collapsed, and tokens sorted so that
-- "Kourani Yasmin" and "Yasmin Kourani" compare equal (the same person filling
-- the form family-name-first).
CREATE OR REPLACE FUNCTION public.student_name_key(p_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT nullif(
    (
      SELECT string_agg(tok, ' ' ORDER BY tok)
      FROM unnest(
        string_to_array(
          btrim(regexp_replace(
            translate(
              lower(coalesce(p_name, '')),
              'ăâîșțşţáàäéèëíìïóòöúùüçñ',
              'aaiststaaaeeeiiiooouuucn'
            ),
            '[^a-z0-9]+', ' ', 'g'
          )),
          ' '
        )
      ) AS tok
      WHERE tok <> ''
    ),
    ''
  );
$$;

COMMENT ON FUNCTION public.student_name_key IS
  'Normalised, diacritic-free, token-sorted name used to tell two people apart when they share a phone number.';

-- Two names are "the same modulo typos" when their normalised keys are equal,
-- or differ by at most 2 edits. The edit tolerance applies only to keys of 8+
-- characters: on a short name 2 edits can turn one real person into another
-- ("Ana" -> "Ane"), whereas on a full name it only absorbs spelling slips.
CREATE OR REPLACE FUNCTION public.student_names_match(p_a text, p_b text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN public.student_name_key(p_a) IS NULL
      OR public.student_name_key(p_b) IS NULL THEN false
    WHEN public.student_name_key(p_a) = public.student_name_key(p_b) THEN true
    WHEN char_length(public.student_name_key(p_a)) >= 8
     AND char_length(public.student_name_key(p_b)) >= 8
     AND extensions.levenshtein(
           public.student_name_key(p_a), public.student_name_key(p_b)
         ) <= 2 THEN true
    ELSE false
  END;
$$;

COMMENT ON FUNCTION public.student_names_match IS
  'True when two names are the same person modulo typos. Used together with a phone match, never on its own.';

-- A shared family phone must no longer be unique. Email stays unique: it is a
-- real identity key. The replacement index keeps the lookup fast.
DROP INDEX IF EXISTS public.idx_students_phone_norm;
CREATE INDEX IF NOT EXISTS idx_students_phone_norm
  ON public.students USING btree (phone_norm)
  WHERE phone_norm IS NOT NULL AND anonymized_at IS NULL;

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

  -- Priority 1: exact email, case-insensitive. An email identifies a person.
  IF v_email_norm IS NOT NULL THEN
    SELECT id INTO v_id FROM public.students
    WHERE email_norm = v_email_norm AND anonymized_at IS NULL
    LIMIT 1;
  END IF;

  -- Priority 2: same phone AND a name that matches modulo typos. The phone on
  -- its own is deliberately NOT enough — that is what merged family members.
  IF v_id IS NULL AND v_phone_norm IS NOT NULL THEN
    SELECT id INTO v_id FROM public.students
    WHERE phone_norm = v_phone_norm
      AND anonymized_at IS NULL
      AND public.student_names_match(full_name, p_name)
    ORDER BY created_at
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
  -- A concurrent insert won the unique email index: re-read instead of failing
  -- the registration. Attribution must never block a paying customer. Only
  -- email can collide now — phone is no longer unique.
  WHEN unique_violation THEN
    SELECT id INTO v_id FROM public.students
    WHERE v_email_norm IS NOT NULL AND email_norm = v_email_norm
    LIMIT 1;
    RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.find_or_create_student IS
  'Duplicate detection: email (case-insensitive), else phone AND a name matching modulo typos. Phone alone never merges — family members share numbers. Never merges existing students; only fills missing contact fields.';

-- Same lock-down as the other definer functions (see 20260813114139).
REVOKE EXECUTE ON FUNCTION public.find_or_create_student(text, text, text) FROM anon, authenticated, PUBLIC;
