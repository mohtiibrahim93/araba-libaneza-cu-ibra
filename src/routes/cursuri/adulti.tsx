import { createFileRoute } from "@tanstack/react-router";
import CursAdulti from "@/pages/courses/CursAdulti";

export const Route = createFileRoute("/cursuri/adulti")({
  component: CursAdulti,
});
