import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoFaraAlfabetArab from "@/pages/seo/FaraAlfabetArab";

export const Route = createFileRoute("/fara-alfabet-arab")({
  head: () => seoHead("/fara-alfabet-arab"),
  component: SeoFaraAlfabetArab,
});
