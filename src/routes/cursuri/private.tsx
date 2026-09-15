import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursPrivate from "@/pages/courses/CursPrivate";

export const Route = createFileRoute("/cursuri/private")({
  head: () => seoHead("/cursuri/private"),
  component: CursPrivate,
});
