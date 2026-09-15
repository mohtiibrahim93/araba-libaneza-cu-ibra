import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursGrupLevel from "@/pages/courses/CursGrupLevel";

export const Route = createFileRoute("/en/courses/group/$level")({
  head: ({ params }) => seoHead(`/en/courses/group/${params.level}`),
  component: CursGrupLevel,
});
