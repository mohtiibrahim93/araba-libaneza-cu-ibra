import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LebaneseArabicPhrases from "@/pages/blog/LebaneseArabicPhrases";

export const Route = createFileRoute("/blog/lebanese-arabic-phrases")({
  head: () => seoHead("/blog/lebanese-arabic-phrases"),
  component: LebaneseArabicPhrases,
});
