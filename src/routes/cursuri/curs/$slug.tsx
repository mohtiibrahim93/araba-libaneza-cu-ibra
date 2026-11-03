import { createFileRoute } from "@tanstack/react-router";
import CourseDetail from "@/pages/courses/CourseDetail";
import NotFound from "@/pages/NotFound";
import { groupPageHead, loadGroupForPage } from "@/lib/courseSlugExists";

export const Route = createFileRoute("/cursuri/curs/$slug")({
  // An address that names no group answers 404 (audit P1 #5).
  loader: ({ params }) => loadGroupForPage(params.slug),
  // Its own title and description when the link is shared (owner, 3 Nov 2026).
  head: ({ loaderData, params }) =>
    groupPageHead(loaderData, "ro", `/cursuri/curs/${params.slug}`),
  notFoundComponent: NotFound,
  component: CourseDetail,
});
