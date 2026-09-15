import { createFileRoute } from "@tanstack/react-router";
import Booking from "@/pages/Booking";

export const Route = createFileRoute("/en/booking")({
  component: Booking,
});
