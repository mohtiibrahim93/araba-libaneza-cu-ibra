import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout only: /joc itself lives in joc.index.tsx, /joc/scor in joc.scor.tsx.
// No head() here — a canonical on the layout would concatenate with the
// leaf's canonical; each leaf serves its own.
export const Route = createFileRoute("/joc")({
  component: () => <Outlet />,
});
