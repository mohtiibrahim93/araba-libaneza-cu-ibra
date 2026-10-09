-- Private correction history (admin/service role only).
CREATE TABLE IF NOT EXISTS public.yalla_card_override_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id text NOT NULL,
  op text NOT NULL,
  old_ar text, old_ro text, old_variants jsonb,
  new_ar text, new_ro text, new_variants jsonb,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.yalla_card_override_history TO service_role;
ALTER TABLE public.yalla_card_override_history ENABLE ROW LEVEL SECURITY;

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

-- Close direct table reads; admin edge function uses service role.
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