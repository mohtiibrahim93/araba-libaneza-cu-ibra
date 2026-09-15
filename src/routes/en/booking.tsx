import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Booking from "@/pages/Booking";

export const Route = createFileRoute("/en/booking")({
  head: () => seoHead("/en/booking"),
  component: Booking,
});
