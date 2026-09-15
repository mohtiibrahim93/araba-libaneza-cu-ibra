import { createFileRoute } from "@tanstack/react-router";
import PrivateStatus from "@/pages/PrivateStatus";

export const Route = createFileRoute("/private-status/$id")({
  component: PrivateStatus,
});
