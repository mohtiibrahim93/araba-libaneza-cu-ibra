import { createFileRoute } from "@tanstack/react-router";
import ArabicTutor from "@/pages/en/ArabicTutor";

export const Route = createFileRoute("/en/arabic-tutor")({
  component: ArabicTutor,
});
