import { createFileRoute } from "@tanstack/react-router";
import CourseDetail from "@/pages/courses/CourseDetail";
import NotFound from "@/pages/NotFound";
import { assertCourseSlugExists } from "@/lib/courseSlugExists";

export const Route = createFileRoute("/cursuri/curs/$slug")({
  // An address that names no group answers 404 (audit P1 #5).
  loader: ({ params }) => assertCourseSlugExists(params.slug),
  notFoundComponent: NotFound,
  component: CourseDetail,
});
