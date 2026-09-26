import { createFileRoute } from "@tanstack/react-router";

/**
 * Is the site answering, and is a worker isolate awake?
 *
 * Two jobs, both cheap. It is the target of the ping in
 * .github/workflows/keep-warm.yml: if the response is not 200 the workflow
 * fails and the repository owner gets an email, and the request itself starts a
 * worker isolate, so whoever arrives next may land on a warm one.
 *
 * Deliberately the smallest possible handler: no database, no rendering, no
 * imports beyond the router. Measured cold, a page takes 1.4–2.6s to answer and
 * a warm one 0.4s — the difference is the isolate booting, and this route exists
 * to pay that cost on a schedule rather than on a visitor.
 *
 * It says nothing a stranger should not see: no version, no environment, no
 * counts.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () =>
        Response.json(
          { ok: true, time: new Date().toISOString() },
          { headers: { "cache-control": "no-store" } },
        ),
    },
  },
});
