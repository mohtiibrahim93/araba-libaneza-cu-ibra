import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LibanezaVsPalestiniana from "@/pages/seo/dialecte/LibanezaVsPalestiniana";

export const Route = createFileRoute(
  "/dialecte-arabe/libaneza-vs-palestiniana",
)({
  head: () => seoHead("/dialecte-arabe/libaneza-vs-palestiniana"),
  component: LibanezaVsPalestiniana,
});
