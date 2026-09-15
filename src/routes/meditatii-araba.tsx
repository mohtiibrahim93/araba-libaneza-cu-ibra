import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoMeditatiiAraba from "@/pages/seo/MeditatiiAraba";

export const Route = createFileRoute("/meditatii-araba")({
  head: () => seoHead("/meditatii-araba"),
  component: SeoMeditatiiAraba,
});
