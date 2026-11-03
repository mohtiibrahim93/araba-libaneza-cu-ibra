import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Preturi from "@/pages/Preturi";

// English twin of /preturi (owner, 3 Nov 2026): the page is bilingual;
// LanguageFromPath (in __root.tsx) renders it in English here.
export const Route = createFileRoute("/en/prices")({
  head: () => seoHead("/en/prices"),
  component: Preturi,
});
