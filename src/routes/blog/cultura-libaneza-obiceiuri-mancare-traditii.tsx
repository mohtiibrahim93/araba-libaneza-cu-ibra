import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CulturaLibaneza from "@/pages/blog/CulturaLibaneza";

export const Route = createFileRoute("/blog/cultura-libaneza-obiceiuri-mancare-traditii")({
  head: () => seoHead("/blog/cultura-libaneza-obiceiuri-mancare-traditii"),
  component: CulturaLibaneza,
});
