import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import ArabicTutor from "@/pages/en/ArabicTutor";

export const Route = createFileRoute("/en/arabic-tutor")({
  head: () => seoHead("/en/arabic-tutor"),
  component: ArabicTutor,
});
