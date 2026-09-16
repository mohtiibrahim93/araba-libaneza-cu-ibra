import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LebaneseVsSyrian from "@/pages/en/dialects/LebaneseVsSyrian";

export const Route = createFileRoute("/en/arabic-dialects-guide/lebanese-vs-syrian-arabic")({
  head: () => seoHead("/en/arabic-dialects-guide/lebanese-vs-syrian-arabic"),
  component: LebaneseVsSyrian,
});
