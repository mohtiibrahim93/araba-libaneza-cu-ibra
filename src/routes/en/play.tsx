import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout only, mirroring /joc: the page itself lives in play/index.tsx and the
// score in play/score.tsx. No head() here — a canonical on the layout would
// concatenate with the leaf's, so each leaf serves its own.
export const Route = createFileRoute("/en/play")({
  component: () => <Outlet />,
});
