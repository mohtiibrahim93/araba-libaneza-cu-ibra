import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LevantinaVsMaghrebina from "@/pages/seo/dialecte/LevantinaVsMaghrebina";

export const Route = createFileRoute("/dialecte-arabe/levantina-vs-maghrebina")({
  head: () => seoHead("/dialecte-arabe/levantina-vs-maghrebina"),
  component: LevantinaVsMaghrebina,
});
