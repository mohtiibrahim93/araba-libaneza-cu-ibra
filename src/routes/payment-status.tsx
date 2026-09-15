import { createFileRoute } from "@tanstack/react-router";
import PaymentStatus from "@/pages/PaymentStatus";

export const Route = createFileRoute("/payment-status")({
  component: PaymentStatus,
});
