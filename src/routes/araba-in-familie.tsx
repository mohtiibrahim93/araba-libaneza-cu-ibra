import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoArabaInFamilie from "@/pages/seo/ArabaInFamilie";

export const Route = createFileRoute("/araba-in-familie")({
  head: () => seoHead("/araba-in-familie"),
  component: SeoArabaInFamilie,
});
