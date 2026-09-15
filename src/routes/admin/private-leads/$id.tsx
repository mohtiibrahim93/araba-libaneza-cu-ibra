import { createFileRoute } from "@tanstack/react-router";
import PrivateLead from "@/pages/PrivateLead";

export const Route = createFileRoute("/admin/private-leads/$id")({
  component: PrivateLead,
});
