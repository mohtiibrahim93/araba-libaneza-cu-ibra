import { createFileRoute } from "@tanstack/react-router";
import ArabicForTeenagers from "@/pages/en/ArabicForTeenagers";

export const Route = createFileRoute("/en/arabic-for-teenagers")({
  component: ArabicForTeenagers,
});
