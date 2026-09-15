import { createFileRoute } from "@tanstack/react-router";
import BestArabicCourse from "@/pages/en/BestArabicCourse";

export const Route = createFileRoute("/en/best-arabic-course")({
  component: BestArabicCourse,
});
