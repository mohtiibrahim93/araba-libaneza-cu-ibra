import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LibanezaVsSiriana from "@/pages/seo/dialecte/LibanezaVsSiriana";

export const Route = createFileRoute("/dialecte-arabe/libaneza-vs-siriana")({
  head: () => seoHead("/dialecte-arabe/libaneza-vs-siriana"),
  component: LibanezaVsSiriana,
});
