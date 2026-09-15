import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoArabaPentruPartener from "@/pages/seo/ArabaPentruPartener";

export const Route = createFileRoute("/araba-pentru-partener")({
  head: () => seoHead("/araba-pentru-partener"),
  component: SeoArabaPentruPartener,
});
