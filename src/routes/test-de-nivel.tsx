import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import TestDeNivel from "@/pages/TestDeNivel";

export const Route = createFileRoute("/test-de-nivel")({
  head: () => seoHead("/test-de-nivel"),
  component: TestDeNivel,
});
