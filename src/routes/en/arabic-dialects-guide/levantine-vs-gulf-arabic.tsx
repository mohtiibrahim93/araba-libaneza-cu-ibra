import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LevantineVsGulf from "@/pages/en/dialects/LevantineVsGulf";

export const Route = createFileRoute("/en/arabic-dialects-guide/levantine-vs-gulf-arabic")({
  head: () => seoHead("/en/arabic-dialects-guide/levantine-vs-gulf-arabic"),
  component: LevantineVsGulf,
});
