import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LebaneseVsEgyptian from "@/pages/en/dialects/LebaneseVsEgyptian";

export const Route = createFileRoute("/en/arabic-dialects-guide/lebanese-vs-egyptian-arabic")({
  head: () => seoHead("/en/arabic-dialects-guide/lebanese-vs-egyptian-arabic"),
  component: LebaneseVsEgyptian,
});
