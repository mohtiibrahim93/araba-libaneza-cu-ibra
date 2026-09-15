import { createFileRoute } from "@tanstack/react-router";
import LebaneseArabicPhrases from "@/pages/blog/LebaneseArabicPhrases";

export const Route = createFileRoute("/blog/lebanese-arabic-phrases")({
  component: LebaneseArabicPhrases,
});
