import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import JocScor from "@/pages/JocScor";

export const Route = createFileRoute("/joc/scor")({
  head: () => seoHead("/joc/scor"),
  component: JocScor,
});
