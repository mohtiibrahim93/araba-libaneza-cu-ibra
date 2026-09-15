import { createFileRoute } from "@tanstack/react-router";
import DeArabischLernen from "@/pages/de/ArabischLernen";

export const Route = createFileRoute("/de/arabisch-lernen")({
  component: DeArabischLernen,
});
