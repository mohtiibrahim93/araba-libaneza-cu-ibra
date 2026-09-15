import { createFileRoute } from "@tanstack/react-router";
import CursGrupLevel from "@/pages/courses/CursGrupLevel";

export const Route = createFileRoute("/cursuri/grup/$level")({
  component: CursGrupLevel,
});
