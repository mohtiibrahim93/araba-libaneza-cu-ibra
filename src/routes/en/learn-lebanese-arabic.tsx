import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LearnLebaneseArabic from "@/pages/en/LearnLebaneseArabic";

export const Route = createFileRoute("/en/learn-lebanese-arabic")({
  head: () => seoHead("/en/learn-lebanese-arabic"),
  component: LearnLebaneseArabic,
});
