import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursAdulti from "@/pages/courses/CursAdulti";

export const Route = createFileRoute("/en/courses/adults")({
  head: () => seoHead("/en/courses/adults"),
  component: CursAdulti,
});
