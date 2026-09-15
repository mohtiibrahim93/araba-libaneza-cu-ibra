import { createFileRoute } from "@tanstack/react-router";
import Joaca from "@/pages/Joaca";

export const Route = createFileRoute("/joaca")({
  component: Joaca,
});
