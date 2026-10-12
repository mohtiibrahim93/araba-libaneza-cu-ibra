import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import VerificareNivel from "@/pages/VerificareNivel";

export const Route = createFileRoute("/verificare-nivel")({
  head: () => seoHead("/verificare-nivel"),
  component: VerificareNivel,
});
