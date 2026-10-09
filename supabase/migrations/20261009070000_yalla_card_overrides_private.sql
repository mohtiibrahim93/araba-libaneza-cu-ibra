-- Correction records become private; only the corrected text stays public.
--
-- The previous migration granted anon SELECT on the whole of
-- `yalla_card_overrides` under a `USING (true)` policy, because the only thing
-- a visitor's game needed was the corrected Arabic and Romanian. But the table
-- is also the record of the correction: which cards an owner judged wrong, and
-- when. "Readable by anyone" was never meant to include that, and a table-wide
-- read grant cannot tell the two apart.
--
-- So the split is made explicit:
--
--   * `yalla_card_override_history` keeps the record — what each card said
--     before and after every insert, update and delete. It is new, so it
--     starts empty; no history existed to lose, because the overlay table was
--     overwritten in place and kept none.
--   * `get_published_card_overrides()` is the public read path, and returns
--     only `card_id, ar, ro, variants` — the four fields the game applies.
--     `updated_at`, and the history table behind it, never leave the database.
--
-- Direct reads of the table close at the same time. Removing the read without
-- putting the function in front of it first would have taken corrections away
-- from every learner and quietly returned them to the bundled text, which is
-- the one outcome this change must not cause: `useCardOverrides.ts` reads the
-- function, fails soft, and sees the same rows it always did.
--
-- Writes are unchanged: no policy, service_role only, so every correction
-- still goes through `admin-registrations` and its ADMIN_EMAILS check.

CREATE TABLE IF NOT EXISTS public.yalla_card_override_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id text NOT NULL,
  -- INSERT, UPDATE or DELETE, as TG_OP reports it.
  op text NOT NULL,
  old_ar text, old_ro text, old_variants jsonb,
  new_ar text, new_ro text, new_variants jsonb,
  changed_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.yalla_card_override_history TO service_role;
ALTER TABLE public.yalla_card_override_history ENABLE ROW LEVEL SECURITY;

-- RLS with no policy already denies anon and authenticated every row. The
-- revoke is the second lock: Supabase grants these roles table privileges by
-- default, so a policy added here by mistake later would open reads that were
-- never meant to exist. Nothing in the panel or the game reads this table.
REVOKE ALL ON public.yalla_card_override_history FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.tg_yalla_card_override_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.yalla_card_override_history(card_id, op, old_ar, old_ro, old_variants, new_ar, new_ro, new_variants)
  VALUES (coalesce(NEW.card_id, OLD.card_id), TG_OP,
          CASE WHEN TG_OP <> 'INSERT' THEN OLD.ar END, CASE WHEN TG_OP <> 'INSERT' THEN OLD.ro END, CASE WHEN TG_OP <> 'INSERT' THEN OLD.variants END,
          CASE WHEN TG_OP <> 'DELETE' THEN NEW.ar END, CASE WHEN TG_OP <> 'DELETE' THEN NEW.ro END, CASE WHEN TG_OP <> 'DELETE' THEN NEW.variants END);
  RETURN coalesce(NEW, OLD);
END; $$;

REVOKE ALL ON FUNCTION public.tg_yalla_card_override_history() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS yalla_card_overrides_history ON public.yalla_card_overrides;
CREATE TRIGGER yalla_card_overrides_history
  AFTER INSERT OR UPDATE OR DELETE ON public.yalla_card_overrides
  FOR EACH ROW EXECUTE FUNCTION public.tg_yalla_card_override_history();

-- Close direct table reads; the admin edge function uses service_role.
DROP POLICY IF EXISTS "yalla_card_overrides public read" ON public.yalla_card_overrides;
REVOKE SELECT ON public.yalla_card_overrides FROM anon, authenticated;

-- Public read path: only the current published text fields.
CREATE OR REPLACE FUNCTION public.get_published_card_overrides()
RETURNS TABLE(card_id text, ar text, ro text, variants jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT card_id, ar, ro, variants FROM public.yalla_card_overrides;
$$;

REVOKE ALL ON FUNCTION public.get_published_card_overrides() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_card_overrides() TO anon, authenticated, service_role;
