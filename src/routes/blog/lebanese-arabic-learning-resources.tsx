import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LebaneseArabicLearningResources from "@/pages/blog/LebaneseArabicLearningResources";

export const Route = createFileRoute("/blog/lebanese-arabic-learning-resources")({
  head: () => seoHead("/blog/lebanese-arabic-learning-resources"),
  component: LebaneseArabicLearningResources,
});
