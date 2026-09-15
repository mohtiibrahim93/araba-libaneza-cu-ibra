import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CatDureaza from "@/pages/blog/CatDureaza";

export const Route = createFileRoute("/blog/cat-dureaza-sa-inveti-araba-libaneza")({
  head: () => seoHead("/blog/cat-dureaza-sa-inveti-araba-libaneza"),
  component: CatDureaza,
});
