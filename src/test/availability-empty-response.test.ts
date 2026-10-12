import { expect, it } from "vitest";
import * as rules from "../../supabase/functions/_shared/schedule-rules";
import { loadEdgeHandler, loadEdgeModule } from "./helpers/edge-handler";

it("returns an empty date map when opening hours produce no candidates", async () => {
  const eventType = { slug: "trial", duration_min: 30 };
  const db = { from: (table: string) => {
    const query = {
      select: () => query, eq: () => query,
      maybeSingle: async () => ({ data: eventType, error: null }),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
    };
    expect(["booking_event_types", "availability_rules"]).toContain(table);
    return query;
  } };
  const handler = loadEdgeHandler("supabase/functions/booking-availability/index.ts", {
    "https://esm.sh/@supabase/supabase-js@2": { createClient: () => db },
    "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
    "../_shared/booking.ts": loadEdgeModule("supabase/functions/_shared/booking.ts", { "./schedule-rules.ts": rules }),
    "../_shared/schedule-rules.ts": rules,
  });
  const response = await handler(new Request("https://example.test/availability?event_type=trial&date_from=2026-11-01&date_to=2026-11-02"));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ slots: [], slots_by_date: {}, tz: "Europe/Bucharest" });
});
