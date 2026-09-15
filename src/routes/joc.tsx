import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Joaca from "@/pages/Joaca";

export const Route = createFileRoute("/joc")({
  head: () => seoHead("/joc"),
  component: Joaca,
});
