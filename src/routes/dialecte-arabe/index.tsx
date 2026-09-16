import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoDialecteArabe from "@/pages/seo/DialecteArabe";

export const Route = createFileRoute("/dialecte-arabe/")({
  head: () => seoHead("/dialecte-arabe"),
  component: SeoDialecteArabe,
});
