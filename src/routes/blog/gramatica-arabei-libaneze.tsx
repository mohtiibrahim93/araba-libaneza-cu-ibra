import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import GramaticaArabaLibaneza from "@/pages/blog/GramaticaArabaLibaneza";

export const Route = createFileRoute("/blog/gramatica-arabei-libaneze")({
  head: () => seoHead("/blog/gramatica-arabei-libaneze"),
  component: GramaticaArabaLibaneza,
});
