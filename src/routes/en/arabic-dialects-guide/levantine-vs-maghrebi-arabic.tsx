import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LevantineVsMaghrebi from "@/pages/en/dialects/LevantineVsMaghrebi";

export const Route = createFileRoute("/en/arabic-dialects-guide/levantine-vs-maghrebi-arabic")({
  head: () => seoHead("/en/arabic-dialects-guide/levantine-vs-maghrebi-arabic"),
  component: LevantineVsMaghrebi,
});
