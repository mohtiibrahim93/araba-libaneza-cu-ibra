import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoResurse from "@/pages/seo/Resurse";

export const Route = createFileRoute("/resurse")({
  head: () => seoHead("/resurse"),
  component: SeoResurse,
});
