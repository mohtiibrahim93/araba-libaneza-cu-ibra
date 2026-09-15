import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoCeArabaSaInveti from "@/pages/seo/CeArabaSaInveti";

export const Route = createFileRoute("/ce-araba-sa-inveti")({
  head: () => seoHead("/ce-araba-sa-inveti"),
  component: SeoCeArabaSaInveti,
});
