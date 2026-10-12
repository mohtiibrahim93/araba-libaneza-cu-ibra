import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeModule } from "./helpers/edge-handler";

/**
 * Owner-confirmed import of an unmatched Google event (for example a lesson he
 * put straight into Google, like Radu's on 11 October). The owner names the
 * student; the lesson is linked to that exact event, with the event's own time,
 * and nothing is written to Google and no email is sent.
 */
const mod = () => loadEdgeModule("supabase/functions/_shared/calendar-reconciliation.ts", {}) as any;
const config = { lovableKey: "synthetic", calendarKey: "synthetic" };
const input = { eventId: "ev1", name: "Radu Test", email: "radu@example.test", phone: null, quantity: 10, paid: false, format: "physical" as const };
const event = { id: "ev1", status: "confirmed", start: { dateTime: "2026-11-15T15:30:00+02:00" }, end: { dateTime: "2026-11-15T16:30:00+02:00" } };

function database(linked: Record<string, unknown[]> = {}, bookingError: unknown = null) {
  const writes: Array<{ table: string; op: string; payload?: any }> = [];
  return {
    writes,
    from: (table: string) => {
      const q: any = {
        select: () => q, eq: () => q,
        limit: async () => ({ data: linked[table] ?? [], error: null }),
        insert: (payload: any) => {
          writes.push({ table, op: "insert", payload });
          if (table === "registrations") return Promise.resolve({ error: null });
          return { select: () => ({ single: async () => (bookingError ? { data: null, error: bookingError } : { data: { id: "new-booking" }, error: null }) }) };
        },
        delete: () => { writes.push({ table, op: "delete" }); return q; },
      };
      return q;
    },
  };
}

describe("importing an unmatched Google event as a private lesson", () => {
  it("uses the event's own time (Romanian offset honoured), links the event and writes nothing to Google", async () => {
    const db = database();
    const calls: Array<{ url: string; method?: string }> = [];
    const out = await mod().importCalendarEvent(db, config, input, async (url: string, init: any) => { calls.push({ url, method: init?.method }); return Response.json(event); });
    expect(calls.map((c) => c.method)).toEqual(["GET"]);
    const booking = db.writes.find((w) => w.table === "bookings")!.payload;
    expect(booking).toMatchObject({ start_at: "2026-11-15T13:30:00.000Z", end_at: "2026-11-15T14:30:00.000Z", google_event_id: "ev1", student_email: "radu@example.test", status: "confirmed", event_type_slug: "paid" });
    const reg = db.writes.find((w) => w.table === "registrations")!.payload;
    expect(reg).toMatchObject({ form_type: "private", source: "admin", quantity: 10, payment_status: "unpaid" });
    expect(out.booking_id).toBe("new-booking");
  });

  it("records a past lesson as completed", async () => {
    const db = database();
    await mod().importCalendarEvent(db, config, input, async () => Response.json({ ...event, start: { dateTime: "2026-10-11T15:30:00+03:00" }, end: { dateTime: "2026-10-11T16:30:00+03:00" } }));
    expect(db.writes.find((w) => w.table === "bookings")!.payload.status).toBe("completed");
  });

  it("refuses an event that is already linked to a lesson or a group session", async () => {
    for (const table of ["bookings", "cohort_sessions"]) {
      const db = database({ [table]: [{ id: "x" }] });
      await expect(mod().importCalendarEvent(db, config, input, async () => Response.json(event))).rejects.toThrow("deja asociat");
      expect(db.writes).toEqual([]);
    }
  });

  it("refuses a cancelled event", async () => {
    const db = database();
    await expect(mod().importCalendarEvent(db, config, input, async () => Response.json({ ...event, status: "cancelled" }))).rejects.toThrow();
    expect(db.writes).toEqual([]);
  });

  it("removes the new registration again if the lesson cannot be saved", async () => {
    const db = database({}, { message: "duplicate key value violates unique constraint" });
    await expect(mod().importCalendarEvent(db, config, input, async () => Response.json(event))).rejects.toThrow("aceeași oră");
    expect(db.writes.map((w) => `${w.table}:${w.op}`)).toEqual(["registrations:insert", "bookings:insert", "registrations:delete"]);
  });
});

describe("unmatched events stay unassigned until the owner acts", () => {
  it("only suggests the guest email; the import needs a name the owner types", () => {
    const form = readFileSync(resolve(process.cwd(), "src/components/admin/ImportCalendarEvent.tsx"), "utf8");
    expect(form).toContain('useState("")'); // name starts empty, never taken from the title
    expect(form).toContain("event.guest_email");
    const panel = readFileSync(resolve(process.cwd(), "src/components/admin/CalendarSyncPanel.tsx"), "utf8");
    expect(panel).toContain("Importă ca lecție privată");
  });
});
