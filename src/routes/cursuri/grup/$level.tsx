import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursGrupLevel from "@/pages/courses/CursGrupLevel";

export const Route = createFileRoute("/cursuri/grup/$level")({
  head: ({ params }) => seoHead(`/cursuri/grup/${params.level}`),
  component: CursGrupLevel,
});
