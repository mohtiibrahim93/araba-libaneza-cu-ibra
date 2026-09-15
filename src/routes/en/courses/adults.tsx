import { createFileRoute } from "@tanstack/react-router";
import CursAdulti from "@/pages/courses/CursAdulti";

export const Route = createFileRoute("/en/courses/adults")({
  component: CursAdulti,
});
