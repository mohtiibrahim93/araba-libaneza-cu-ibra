import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursPrivate from "@/pages/courses/CursPrivate";

export const Route = createFileRoute("/en/courses/private")({
  head: () => seoHead("/en/courses/private"),
  component: CursPrivate,
});
