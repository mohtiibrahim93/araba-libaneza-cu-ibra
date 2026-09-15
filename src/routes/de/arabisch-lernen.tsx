import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import DeArabischLernen from "@/pages/de/ArabischLernen";

export const Route = createFileRoute("/de/arabisch-lernen")({
  head: () => seoHead("/de/arabisch-lernen"),
  component: DeArabischLernen,
});
