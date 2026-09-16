import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LevantinaVsPeninsulara from "@/pages/seo/dialecte/LevantinaVsPeninsulara";

export const Route = createFileRoute("/dialecte-arabe/levantina-vs-peninsulara")({
  head: () => seoHead("/dialecte-arabe/levantina-vs-peninsulara"),
  component: LevantinaVsPeninsulara,
});
