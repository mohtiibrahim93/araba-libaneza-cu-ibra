import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoCursuriAraba from "@/pages/seo/CursuriAraba";

export const Route = createFileRoute("/cursuri-limba-araba")({
  head: () => seoHead("/cursuri-limba-araba"),
  component: SeoCursuriAraba,
});
