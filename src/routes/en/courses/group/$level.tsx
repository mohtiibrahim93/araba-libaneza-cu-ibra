import { createFileRoute } from "@tanstack/react-router";
import CursGrupLevel from "@/pages/courses/CursGrupLevel";

export const Route = createFileRoute("/en/courses/group/$level")({
  component: CursGrupLevel,
});
