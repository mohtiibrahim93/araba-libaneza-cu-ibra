CREATE TABLE IF NOT EXISTS public.yalla_card_overrides (
  card_id text PRIMARY KEY,
  ar text NOT NULL,
  ro text NOT NULL,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT yalla_card_overrides_ar_not_blank CHECK (btrim(ar) <> ''),
  CONSTRAINT yalla_card_overrides_ro_not_blank CHECK (btrim(ro) <> ''),
  CONSTRAINT yalla_card_overrides_variants_is_array CHECK (jsonb_typeof(variants) = 'array')
);
GRANT SELECT ON public.yalla_card_overrides TO anon, authenticated;
GRANT ALL ON public.yalla_card_overrides TO service_role;
ALTER TABLE public.yalla_card_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "yalla_card_overrides public read" ON public.yalla_card_overrides FOR SELECT USING (true);
CREATE TRIGGER yalla_card_overrides_set_updated_at BEFORE UPDATE ON public.yalla_card_overrides FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();