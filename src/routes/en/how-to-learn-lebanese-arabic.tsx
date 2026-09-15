import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import HowToLearnLebaneseArabic from "@/pages/en/HowToLearnLebaneseArabic";

export const Route = createFileRoute("/en/how-to-learn-lebanese-arabic")({
  head: () => seoHead("/en/how-to-learn-lebanese-arabic"),
  component: HowToLearnLebaneseArabic,
});
