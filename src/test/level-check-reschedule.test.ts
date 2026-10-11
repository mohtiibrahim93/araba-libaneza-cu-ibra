import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as scheduleRules from "../../supabase/functions/_shared/schedule-rules";
import { loadEdgeHandler, loadEdgeModule } from "./helpers/edge-handler";

function setup(pendingContact = false) {
  const updates: Array<Record<string, unknown>> = [];
  const moves: Array<Record<string, unknown>> = [];
  const writes: string[] = [];
  const booking = {
    id: "old-booking", event_type_slug: "verificare-nivel", format: "online", status: "confirmed",
    start_at: "2026-11-03T10:00:00Z", end_at: "2026-11-03T10:30:00Z", manage_token: "test-token-with-over-20-characters",
    google_event_id: pendingContact ? "google-event" : null, google_sync_error: pendingContact ? "contact_update_pending" : null,
    student_name: "Synthetic Student", student_email: "student@example.test",
    booking_event_types: { slug: "verificare-nivel", duration_min: 30, buffer_before_min: 0, buffer_after_min: 0, min_notice_hours: 0, max_advance_days: 30 },
  };
  const db = { rpc: async (name: string, params: Record<string, unknown>) => {
    writes.push(name); moves.push(params);
    return { data: { ...booking, id: "new-booking", start_at: params["p_start"], end_at: params["p_end"], google_sync_error: booking.google_event_id ? "reschedule_update_pending" : "missing_calendar_event" }, error: null };
  }, from: (table: string) => {
    let mutation = false;
    const query = {
      select: () => query, is: () => query, eq: () => query, neq: () => query, lt: () => query, gt: () => query, in: () => query,
      update: (patch: Record<string, unknown>) => { updates.push(patch); mutation = true; writes.push("update"); return query; },
      insert: () => { mutation = true; writes.push("insert"); return query; },
      maybeSingle: async () => ({ data: booking, error: null }),
      single: async () => ({ data: { ...booking, id: "new-booking" }, error: null }),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: mutation ? [booking] : table === "availability_rules" ? [{ weekday: 1, start_time: "18:00:00", end_time: "19:00:00" }] : [], error: null }).then(resolve),
    };
    return query;
  } };
  const handler = loadEdgeHandler("supabase/functions/booking-manage/index.ts", {
    "https://esm.sh/@supabase/supabase-js@2": { createClient: () => db },
    "../_shared/booking.ts": { ...loadEdgeModule("supabase/functions/_shared/booking.ts", { "./schedule-rules.ts": scheduleRules }), gcalFreebusy: async () => [], gcalPatchEvent: async () => true, gcalDeleteEvent: async () => true },
    "../_shared/schedule-rules.ts": scheduleRules,
    "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
    "../_shared/booking-emails.ts": { fmtBookingLocal: () => "test-time", manageUrl: () => "https://example.test/manage", sendBookingEmail: () => {}, sendAdminBookingEmail: () => {} },
  });
  const move = (start: string) => handler(new Request(`https://example.test/booking-manage/${booking.manage_token}`, {
    method: "PATCH", body: JSON.stringify({ start_at: start }), headers: { "Content-Type": "application/json" },
  }));
  return { move, writes, moves, updates };
}

describe("level-check rescheduling uses its offered hours", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-01T00:00:00Z")); });
  afterEach(() => vi.useRealTimers());
  it("accepts weekday noon even when general hours are evenings", async () => {
    const { move, moves } = setup();
    const response = await move("2026-11-02T10:00:00Z");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
    expect(moves).toEqual([{ p_id: "old-booking", p_expected_start: "2026-11-03T10:00:00Z", p_expected_event: null, p_start: "2026-11-02T10:00:00.000Z", p_end: "2026-11-02T10:30:00.000Z" }]);
  });
  it("keeps a pending contact update after the Google time update succeeds", async () => {
    const { move, updates } = setup(true);
    const response = await move("2026-11-02T10:00:00Z");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, sync_pending: true });
    expect(updates).toContainEqual({ google_sync_error: "contact_update_pending" });
  });
  it("rejects general evening hours for a level check without writing", async () => {
    const { move, writes } = setup();
    const response = await move("2026-11-02T16:00:00Z");
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "invalid_slot" });
    expect(writes).toEqual([]);
  });
});
