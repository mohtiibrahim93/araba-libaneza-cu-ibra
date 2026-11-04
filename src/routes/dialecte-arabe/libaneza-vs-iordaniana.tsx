import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LibanezaVsIordaniana from "@/pages/seo/dialecte/LibanezaVsIordaniana";

export const Route = createFileRoute(
  "/dialecte-arabe/libaneza-vs-iordaniana",
)({
  head: () => seoHead("/dialecte-arabe/libaneza-vs-iordaniana"),
  component: LibanezaVsIordaniana,
});
