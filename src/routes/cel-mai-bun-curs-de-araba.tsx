import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoCelMaiBunCursAraba from "@/pages/seo/CelMaiBunCursAraba";

export const Route = createFileRoute("/cel-mai-bun-curs-de-araba")({
  head: () => seoHead("/cel-mai-bun-curs-de-araba"),
  component: SeoCelMaiBunCursAraba,
});
