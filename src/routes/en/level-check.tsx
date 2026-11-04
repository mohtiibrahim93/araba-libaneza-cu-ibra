import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import VerificareNivel from "@/pages/VerificareNivel";

// English twin of /verificare-nivel (owner, 4 Nov 2026): the page is
// bilingual; LanguageFromPath (in __root.tsx) renders it in English here.
export const Route = createFileRoute("/en/level-check")({
  head: () => seoHead("/en/level-check"),
  component: VerificareNivel,
});
