import { createFileRoute } from "@tanstack/react-router";
import CursCopii from "@/pages/courses/CursCopii";

export const Route = createFileRoute("/cursuri/copii")({
  component: CursCopii,
});
