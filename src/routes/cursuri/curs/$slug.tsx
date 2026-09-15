import { createFileRoute } from "@tanstack/react-router";
import CourseDetail from "@/pages/courses/CourseDetail";

export const Route = createFileRoute("/cursuri/curs/$slug")({
  component: CourseDetail,
});
