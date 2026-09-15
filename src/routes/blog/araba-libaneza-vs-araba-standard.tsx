import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import ArabaLibanezaVsArabaStandard from "@/pages/blog/ArabaLibanezaVsArabaStandard";

export const Route = createFileRoute("/blog/araba-libaneza-vs-araba-standard")({
  head: () => seoHead("/blog/araba-libaneza-vs-araba-standard"),
  component: ArabaLibanezaVsArabaStandard,
});
