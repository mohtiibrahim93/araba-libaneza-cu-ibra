import { createFileRoute } from "@tanstack/react-router";
import PaymentStatus from "@/pages/PaymentStatus";

// Head served from the route, not from a <Helmet> in the page — see checkout.tsx.
export const Route = createFileRoute("/payment-status")({
  head: () => ({
    meta: [
      { title: "Status plată — Centrul de Arabă Libaneză" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentStatus,
});
