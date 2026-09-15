import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LebaneseVsMsaVsEgyptian from "@/pages/en/LebaneseVsMsaVsEgyptian";

export const Route = createFileRoute("/en/lebanese-arabic-vs-msa-vs-egyptian")({
  head: () => seoHead("/en/lebanese-arabic-vs-msa-vs-egyptian"),
  component: LebaneseVsMsaVsEgyptian,
});
