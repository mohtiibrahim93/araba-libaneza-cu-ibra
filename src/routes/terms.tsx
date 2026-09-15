import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Terms from "@/pages/Terms";

export const Route = createFileRoute("/terms")({
  head: () => seoHead("/terms"),
  component: Terms,
});
