import { createFileRoute } from "@tanstack/react-router";
import LearnLebaneseArabic from "@/pages/en/LearnLebaneseArabic";

export const Route = createFileRoute("/en/learn-lebanese-arabic")({
  component: LearnLebaneseArabic,
});
