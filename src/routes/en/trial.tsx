import { createFileRoute } from "@tanstack/react-router";
import Trial from "@/pages/Trial";

export const Route = createFileRoute("/en/trial")({
  component: Trial,
});
