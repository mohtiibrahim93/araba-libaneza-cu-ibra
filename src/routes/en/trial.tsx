import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Trial from "@/pages/Trial";

export const Route = createFileRoute("/en/trial")({
  head: () => seoHead("/en/trial"),
  component: Trial,
});
