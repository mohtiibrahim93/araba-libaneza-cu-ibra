import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SiriacaInArabaLibaneza from "@/pages/blog/SiriacaInArabaLibaneza";

export const Route = createFileRoute("/blog/siriaca-in-araba-libaneza")({
  head: () => seoHead("/blog/siriaca-in-araba-libaneza"),
  component: SiriacaInArabaLibaneza,
});
