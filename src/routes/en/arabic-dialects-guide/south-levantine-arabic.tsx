import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SouthLevantine from "@/pages/en/dialects/SouthLevantine";

export const Route = createFileRoute(
  "/en/arabic-dialects-guide/south-levantine-arabic",
)({
  head: () => seoHead("/en/arabic-dialects-guide/south-levantine-arabic"),
  component: SouthLevantine,
});
