import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursGrup from "@/pages/courses/CursGrup";

export const Route = createFileRoute("/cursuri/grup/")({
  head: () => seoHead("/cursuri/grup"),
  component: CursGrup,
});
