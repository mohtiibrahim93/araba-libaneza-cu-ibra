import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursGrup from "@/pages/courses/CursGrup";

export const Route = createFileRoute("/en/courses/group/")({
  head: () => seoHead("/en/courses/group"),
  component: CursGrup,
});
