-- Teacher corrections to the Yalla card bank, shared with every student.
--
-- Corrections made in the game's teacher workspace were written to that
-- browser's localStorage and nowhere else. They fixed the cards for the
-- teacher and for nobody else: students kept seeing the original text, and
-- nothing about the page revealed the difference. This table is where a
-- correction goes to become real.
--
-- The game keeps its bundled card bank in public/yalla/content.js. Rows here
-- are an overlay on top of it, keyed by the card's stable id, so the bundle
-- stays the source of truth for everything untouched and a correction is a
-- small diff rather than a fork of 4,315 cards.
--
-- Writes deliberately have NO policy. Following the same shape as site_texts
-- and page_contents, anon and authenticated may read and only service_role may
-- write, which means every change goes through the admin edge function and its
-- ADMIN_EMAILS check. A public write policy here would let anyone rewrite what
-- the game teaches, to every learner at once.
CREATE TABLE public.yalla_card_overrides (
  -- The card's id from content.js. Not a generated key: student review history
  -- is keyed on this id too, so it is the join between bundle and overlay.
  card_id text PRIMARY KEY,
  ar text NOT NULL,
  ro text NOT NULL,
  -- Alternative spellings the engine accepts as correct. jsonb rather than
  -- text[] to match the shape the game already stores and exports.
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT yalla_card_overrides_ar_not_blank CHECK (btrim(ar) <> ''),
  CONSTRAINT yalla_card_overrides_ro_not_blank CHECK (btrim(ro) <> ''),
  CONSTRAINT yalla_card_overrides_variants_is_array CHECK (jsonb_typeof(variants) = 'array')
);

GRANT SELECT ON public.yalla_card_overrides TO anon, authenticated;
GRANT ALL ON public.yalla_card_overrides TO service_role;
ALTER TABLE public.yalla_card_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "yalla_card_overrides public read"
  ON public.yalla_card_overrides FOR SELECT USING (true);

CREATE TRIGGER yalla_card_overrides_set_updated_at
  BEFORE UPDATE ON public.yalla_card_overrides
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
