import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LevantineVsPeninsular from "@/pages/en/dialects/LevantineVsPeninsular";

export const Route = createFileRoute("/en/arabic-dialects-guide/levantine-vs-peninsular-arabic")({
  head: () => seoHead("/en/arabic-dialects-guide/levantine-vs-peninsular-arabic"),
  component: LevantineVsPeninsular,
});
