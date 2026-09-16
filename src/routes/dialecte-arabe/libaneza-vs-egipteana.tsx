import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LibanezaVsEgipteana from "@/pages/seo/dialecte/LibanezaVsEgipteana";

export const Route = createFileRoute("/dialecte-arabe/libaneza-vs-egipteana")({
  head: () => seoHead("/dialecte-arabe/libaneza-vs-egipteana"),
  component: LibanezaVsEgipteana,
});
