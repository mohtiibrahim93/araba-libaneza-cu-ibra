import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import AboutTeacher from "@/pages/AboutTeacher";

export const Route = createFileRoute("/en/about-us")({
  head: () => seoHead("/en/about-us"),
  component: () => <AboutTeacher lang="en" />,
});
