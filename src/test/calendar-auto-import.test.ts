import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeModule } from "./helpers/edge-handler";

/**
 * Lessons the owner puts straight into Google (Radu, Ioan, Ioana, Diana) are
 * picked up by the sync itself (owner-approved rule, 13 October 2026): the
 * title says "araba libaneza" and the event has exactly one guest, whose email
 * is the student. Nothing is written to Google and no reminder email is sent.
 */
const mod = () => loadEdgeModule("supabase/functions/_shared/calendar-reconciliation.ts", {}) as any;
const config = { lovableKey: "synthetic", calendarKey: "synthetic", from: "2026-10-06T00:00:00Z", to: "2026-11-30T00:00:00Z" };
const owner = { email: "owner@example.test", organizer: true, self: true };
const radu = {
  id: "ev-radu", summary: "Araba Libaneza-L1/10- Adulti- Fizic- Privat",
  attendees: [owner, { email: "Radu.Nicolae@example.test" }],
  start: { dateTime: "2026-11-15T15:30:00+02:00" }, end: { dateTime: "2026-11-15T16:30:00+02:00" },
};

function database(existing: any[] = [], bookingError: unknown = null) {
  const inserts: Array<{ table: string; payload: any }> = [];
  const deletes: string[] = [];
  const db = {
    inserts, deletes,
    from: (table: string) => {
      let insertPayload: any = null;
      const q: any = {
        select: () => q, order: () => q, range: () => q, eq: () => q, is: () => q, or: () => q,
        limit: async () => ({ data: table === "registrations" ? existing : [], error: null }),
        insert: (payload: any) => { inserts.push({ table, payload }); insertPayload = payload; return q; },
        delete: () => { deletes.push(table); return q; },
        single: async () => (bookingError ? { data: null, error: bookingError } : { data: { id: "new-booking" }, error: null }),
        then: (resolve: any) => resolve({ data: insertPayload ? null : [], error: null }),
      };
      return q;
    },
  };
  return db;
}
const google = (items: any[]) => {
  const calls: Array<string | undefined> = [];
  const request = async (_url: string, init: any) => { calls.push(init?.method); return Response.json({ items }); };
  return { calls, request };
};

describe("the sync picks up lessons put straight into Google", () => {
  it("creates the student from the guest's email and links the lesson, writing nothing to Google", async () => {
    const db = database();
    const g = google([radu]);
    const out = await mod().reconcileCalendar(db, config, g.request);
    expect(out.imported).toBe(1);
    expect(out.unmatched).toEqual([]);
    expect(g.calls.every((m) => m === undefined)).toBe(true);
    const reg = db.inserts.find((i) => i.table === "registrations")!.payload;
    expect(reg).toMatchObject({ form_type: "private", source: "admin", name: "Radu Nicolae", email: "radu.nicolae@example.test", phone: "", quantity: 10, payment_status: "unpaid", format: "fizic" });
    const booking = db.inserts.find((i) => i.table === "bookings")!.payload;
    expect(booking).toMatchObject({ registration_id: reg.id, google_event_id: "ev-radu", start_at: "2026-11-15T13:30:00.000Z", status: "confirmed", event_type_slug: "paid", format: "physical" });
    for (const flag of ["reminder_2d_sent_at", "reminder_day_of_sent_at", "reminder_3h_sent_at", "reminder_1h_sent_at", "reminder_30m_sent_at"]) expect(booking[flag]).toBeTruthy();
  });

  it("reuses the student's existing private registration", async () => {
    const db = database([{ id: "reg-ioan", name: "Ioan J", phone: "0700", format: "online" }]);
    await mod().reconcileCalendar(db, config, google([{ ...radu, id: "ev-ioan", summary: "Ioan , lectia 27 araba libaneza- 2/20" }]).request);
    expect(db.inserts.filter((i) => i.table === "registrations")).toEqual([]);
    expect(db.inserts.find((i) => i.table === "bookings")!.payload).toMatchObject({ registration_id: "reg-ioan", student_name: "Ioan J", student_phone: "0700" });
  });

  it("leaves events that are not clearly a lesson for the owner", async () => {
    const db = database();
    const out = await mod().reconcileCalendar(db, config, google([
      { ...radu, id: "two-guests", attendees: [owner, { email: "a@example.test" }, { email: "b@example.test" }] },
      { ...radu, id: "other-title", summary: "Romanian lessson 38 7/20 carlo" },
      { ...radu, id: "no-guest", summary: "Edge advisors- consultant financiar job", attendees: [owner] },
    ]).request);
    expect(out.imported).toBe(0);
    expect(db.inserts).toEqual([]);
    expect(out.unmatched.map((e: any) => e.id)).toEqual(["two-guests", "other-title"]);
  });

  it("keeps an event listed, and removes the new student, when the lesson cannot be linked", async () => {
    const db = database([], { message: "duplicate key value violates unique constraint" });
    const out = await mod().reconcileCalendar(db, config, google([radu]).request);
    expect(out.imported).toBe(0);
    expect(out.errors).toEqual([]);
    expect(out.unmatched.map((e: any) => e.id)).toEqual(["ev-radu"]);
    expect(db.deletes).toContain("registrations");
  });
});

describe("names and package sizes", () => {
  it("takes the name the owner wrote in the title, else the guest's name, else the email", () => {
    const { lessonStudentName } = mod();
    expect(lessonStudentName("Ioan , lectia 27 araba libaneza- 2/20", "ioanjabre@example.test", null)).toBe("Ioan");
    expect(lessonStudentName("Ioana- Uk lectia 8/20 araba libaneza", "x@example.test", "Someone")).toBe("Ioana");
    expect(lessonStudentName("Lectia 2 (araba libaneza)", "diana@example.test", "Diana Costache")).toBe("Diana Costache");
    expect(lessonStudentName("Lectia I (araba libaneza)", "dianacostache04@example.test", null)).toBe("Dianacostache");
  });
  it("reads the package size from x/N", () => {
    const { lessonPackageSize } = mod();
    expect(lessonPackageSize("Araba Libaneza-L1/10- Adulti")).toBe(10);
    expect(lessonPackageSize("Lectia 2 (araba libaneza)")).toBe(1);
  });
});

describe("one lesson per Google event", () => {
  it("is enforced by the database", () => {
    const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20261013100000_bookings_google_event_unique.sql"), "utf8");
    expect(sql).toContain("ON public.bookings (google_event_id)");
    expect(sql).toContain("WHERE google_event_id IS NOT NULL");
  });
});
