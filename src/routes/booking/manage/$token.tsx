import { createFileRoute } from "@tanstack/react-router";
import BookingManage from "@/pages/BookingManage";

export const Route = createFileRoute("/booking/manage/$token")({
  component: BookingManage,
});
