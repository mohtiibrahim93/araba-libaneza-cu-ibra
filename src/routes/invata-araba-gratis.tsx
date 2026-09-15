import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoInvataArabaGratis from "@/pages/seo/InvataArabaGratis";

export const Route = createFileRoute("/invata-araba-gratis")({
  head: () => seoHead("/invata-araba-gratis"),
  component: SeoInvataArabaGratis,
});
