import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import InvataArabaOnline from "@/pages/blog/InvataArabaOnline";

export const Route = createFileRoute("/blog/invata-araba-libaneza-online")({
  head: () => seoHead("/blog/invata-araba-libaneza-online"),
  component: InvataArabaOnline,
});
