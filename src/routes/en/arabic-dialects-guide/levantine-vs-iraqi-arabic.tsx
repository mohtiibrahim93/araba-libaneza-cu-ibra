import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LevantineVsIraqi from "@/pages/en/dialects/LevantineVsIraqi";

export const Route = createFileRoute("/en/arabic-dialects-guide/levantine-vs-iraqi-arabic")({
  head: () => seoHead("/en/arabic-dialects-guide/levantine-vs-iraqi-arabic"),
  component: LevantineVsIraqi,
});
