import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LimbileVorbiteInLiban from "@/pages/blog/LimbileVorbiteInLiban";

export const Route = createFileRoute("/blog/limbile-vorbite-in-liban")({
  head: () => seoHead("/blog/limbile-vorbite-in-liban"),
  component: LimbileVorbiteInLiban,
});
