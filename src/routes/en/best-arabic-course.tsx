import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import BestArabicCourse from "@/pages/en/BestArabicCourse";

export const Route = createFileRoute("/en/best-arabic-course")({
  head: () => seoHead("/en/best-arabic-course"),
  component: BestArabicCourse,
});
