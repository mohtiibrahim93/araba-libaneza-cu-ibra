import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SfantulEfremBisericaMaronita from "@/pages/blog/SfantulEfremBisericaMaronita";

export const Route = createFileRoute("/blog/sfantul-efrem-sirul-si-biserica-maronita")({
  head: () => seoHead("/blog/sfantul-efrem-sirul-si-biserica-maronita"),
  component: SfantulEfremBisericaMaronita,
});
