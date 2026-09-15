import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CeEsteArabizi from "@/pages/blog/CeEsteArabizi";

export const Route = createFileRoute("/blog/ce-este-arabizi")({
  head: () => seoHead("/blog/ce-este-arabizi"),
  component: CeEsteArabizi,
});
