import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoArabizi from "@/pages/seo/Arabizi";

export const Route = createFileRoute("/arabizi")({
  head: () => seoHead("/arabizi"),
  component: SeoArabizi,
});
