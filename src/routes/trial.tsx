import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Trial from "@/pages/Trial";

export const Route = createFileRoute("/trial")({
  head: () => seoHead("/trial"),
  component: Trial,
});
