import { createFileRoute } from "@tanstack/react-router";
import CourseDetail from "@/pages/courses/CourseDetail";

// English twin of /cursuri/curs/$slug: one page per group, same slug.
export const Route = createFileRoute("/en/courses/course/$slug")({
  component: CourseDetail,
});
