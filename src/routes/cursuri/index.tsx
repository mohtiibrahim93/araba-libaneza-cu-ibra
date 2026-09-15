import { createFileRoute } from "@tanstack/react-router";
import Cursuri from "@/pages/courses/Cursuri";

export const Route = createFileRoute("/cursuri/")({
  component: Cursuri,
});
