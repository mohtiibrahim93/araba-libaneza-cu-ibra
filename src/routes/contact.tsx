import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Contact from "@/pages/Contact";

export const Route = createFileRoute("/contact")({
  head: () => seoHead("/contact"),
  component: () => <Contact lang="ro" />,
});
