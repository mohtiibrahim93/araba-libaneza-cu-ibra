import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import ArabicDialectsGuide from "@/pages/en/ArabicDialectsGuide";

export const Route = createFileRoute("/en/arabic-dialects-guide")({
  head: () => seoHead("/en/arabic-dialects-guide"),
  component: ArabicDialectsGuide,
});
