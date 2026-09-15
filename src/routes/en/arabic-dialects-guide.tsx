import { createFileRoute } from "@tanstack/react-router";
import ArabicDialectsGuide from "@/pages/en/ArabicDialectsGuide";

export const Route = createFileRoute("/en/arabic-dialects-guide")({
  component: ArabicDialectsGuide,
});
