import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoCursuriArabaAdolescenti from "@/pages/seo/CursuriArabaAdolescenti";

export const Route = createFileRoute("/cursuri-araba-adolescenti")({
  head: () => seoHead("/cursuri-araba-adolescenti"),
  component: SeoCursuriArabaAdolescenti,
});
