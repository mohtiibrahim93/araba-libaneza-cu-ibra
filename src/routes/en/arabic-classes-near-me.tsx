import { createFileRoute } from "@tanstack/react-router";
import ArabicClassesNearMe from "@/pages/en/ArabicClassesNearMe";

export const Route = createFileRoute("/en/arabic-classes-near-me")({
  component: ArabicClassesNearMe,
});
