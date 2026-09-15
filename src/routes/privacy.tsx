import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Privacy from "@/pages/Privacy";

export const Route = createFileRoute("/privacy")({
  head: () => seoHead("/privacy"),
  component: Privacy,
});
