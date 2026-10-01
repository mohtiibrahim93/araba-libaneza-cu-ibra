import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Index from "@/pages/Index";

export const Route = createFileRoute("/en/")({
  head: () => seoHead("/en"),
  component: Index,
});
