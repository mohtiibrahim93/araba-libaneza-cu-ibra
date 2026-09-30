import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import JocScor from "@/pages/JocScor";

// The English twin of /joc/scor.
export const Route = createFileRoute("/en/play/score")({
  head: () => seoHead("/en/play/score"),
  component: JocScor,
});
