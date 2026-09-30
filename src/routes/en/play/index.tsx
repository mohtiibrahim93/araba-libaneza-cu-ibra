import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Joaca from "@/pages/Joaca";

// The English twin of /joc. One bilingual component, two URLs — the page reads
// its language from useI18n(), and /en/ forces English, so there is nothing to
// duplicate. The twin exists now because the game itself is bilingual: the card
// meanings, the drills and the level test all follow the site language.
export const Route = createFileRoute("/en/play/")({
  head: () => seoHead("/en/play"),
  component: Joaca,
});
