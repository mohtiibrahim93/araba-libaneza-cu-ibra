import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import ArabicClassesNearMe from "@/pages/en/ArabicClassesNearMe";

export const Route = createFileRoute("/en/arabic-classes-near-me")({
  head: () => seoHead("/en/arabic-classes-near-me"),
  component: ArabicClassesNearMe,
});
