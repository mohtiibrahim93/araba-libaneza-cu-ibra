import { createFileRoute } from "@tanstack/react-router";
import CursCopii from "@/pages/courses/CursCopii";

export const Route = createFileRoute("/en/courses/children")({
  component: CursCopii,
});
