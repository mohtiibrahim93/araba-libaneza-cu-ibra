import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Contact from "@/pages/Contact";

export const Route = createFileRoute("/en/contact")({
  head: () => seoHead("/en/contact"),
  component: () => <Contact lang="en" />,
});
