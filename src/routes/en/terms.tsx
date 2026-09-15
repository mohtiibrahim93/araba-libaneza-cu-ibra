import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Terms from "@/pages/Terms";

export const Route = createFileRoute("/en/terms")({
  head: () => seoHead("/en/terms"),
  component: Terms,
});
