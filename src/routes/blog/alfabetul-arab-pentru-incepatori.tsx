import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import AlfabetulArab from "@/pages/blog/AlfabetulArab";

export const Route = createFileRoute("/blog/alfabetul-arab-pentru-incepatori")({
  head: () => seoHead("/blog/alfabetul-arab-pentru-incepatori"),
  component: AlfabetulArab,
});
