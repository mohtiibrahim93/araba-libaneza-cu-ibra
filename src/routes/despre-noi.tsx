import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import AboutTeacher from "@/pages/AboutTeacher";

export const Route = createFileRoute("/despre-noi")({
  head: () => seoHead("/despre-noi"),
  component: () => <AboutTeacher lang="ro" />,
});
