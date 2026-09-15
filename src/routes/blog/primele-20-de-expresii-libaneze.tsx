import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Primele20Expresii from "@/pages/blog/Primele20Expresii";

export const Route = createFileRoute("/blog/primele-20-de-expresii-libaneze")({
  head: () => seoHead("/blog/primele-20-de-expresii-libaneze"),
  component: Primele20Expresii,
});
