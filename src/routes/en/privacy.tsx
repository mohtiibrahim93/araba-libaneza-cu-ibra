import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Privacy from "@/pages/Privacy";

export const Route = createFileRoute("/en/privacy")({
  head: () => seoHead("/en/privacy"),
  component: Privacy,
});
