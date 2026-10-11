import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as scheduleRules from "../../supabase/functions/_shared/schedule-rules";
import { loadEdgeHandler, loadEdgeModule } from "./helpers/edge-handler";

function setup() {
  const writes: string[] = [];
  const booking = {
    id: "old-booking", event_type_slug: "verificare-nivel", format: "online", status: "confirmed",
    start_at: "2026-11-03T10:00:00Z", end_at: "2026-11-03T10:30:00Z", manage_token: "test-token-with-over-20-characters",
    student_name: "Synthetic Student", student_email: "student@example.test",
    booking_event_types: { slug: "verificare-nivel", duration_min: 30, buffer_before_min: 0, buffer_after_min: 0, min_notice_hours: 0, max_advance_days: 30 },
  };
  const db = { from: (table: string) => {
    let mutation = false;
    const query = {
      select: () => query, eq: () => query, neq: () => query, lt: () => query, gt: () => query, in: () => query,
      update: () => { mutation = true; writes.push("update"); return query; },
      insert: () => { mutation = true; writes.push("insert"); return query; },
      maybeSingle: async () => ({ data: booking, error: null }),
      single: async () => ({ data: { ...booking, id: "new-booking" }, error: null }),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: mutation ? [booking] : table === "availability_rules" ? [{ weekday: 1, start_time: "18:00:00", end_time: "19:00:00" }] : [], error: null }).then(resolve),
    };
    return query;
  } };
  const handler = loadEdgeHandler("supabase/functions/booking-manage/index.ts", {
    "https://esm.sh/@supabase/supabase-js@2": { createClient: () => db },
    "../_shared/booking.ts": { ...loadEdgeModule("supabase/functions/_shared/booking.ts", { "./schedule-rules.ts": scheduleRules }), gcalFreebusy: async () => [] },
    "../_shared/schedule-rules.ts": scheduleRules,
    "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
    "../_shared/booking-emails.ts": { fmtBookingLocal: () => "test-time", manageUrl: () => "https://example.test/manage", sendBookingEmail: () => {}, sendAdminBookingEmail: () => {} },
  });
  const move = (start: string) => handler(new Request(`https://example.test/booking-manage/${booking.manage_token}`, {
    method: "PATCH", body: JSON.stringify({ start_at: start }), headers: { "Content-Type": "application/json" },
  }));
  return { move, writes };
}

describe("level-check rescheduling uses its offered hours", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-01T00:00:00Z")); });
  afterEach(() => vi.useRealTimers());
  it("accepts weekday noon even when general hours are evenings", async () => {
    const { move } = setup();
    const response = await move("2026-11-02T10:00:00Z");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
  });
  it("rejects general evening hours for a level check without writing", async () => {
    const { move, writes } = setup();
    const response = await move("2026-11-02T16:00:00Z");
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "invalid_slot" });
    expect(writes).toEqual([]);
  });
});
