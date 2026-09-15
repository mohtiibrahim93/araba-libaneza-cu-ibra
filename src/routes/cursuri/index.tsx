import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Cursuri from "@/pages/courses/Cursuri";

export const Route = createFileRoute("/cursuri/")({
  head: () => seoHead("/cursuri"),
  component: Cursuri,
});
