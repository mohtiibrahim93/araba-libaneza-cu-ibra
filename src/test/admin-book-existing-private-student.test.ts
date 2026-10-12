import { afterEach, describe, expect, it, vi } from "vitest";
import { loadEdgeHandler } from "./helpers/edge-handler";

/**
 * Task 5: the owner books a lesson for a private student who registered on the
 * website (or whom he booked before), on that student's own registration.
 *
 * Until now "Programează o lecție privată" always created a fresh registration,
 * so a website student's paid package could not be booked lesson by lesson
 * from the panel. The lesson now goes on the existing registration, uses the
 * stored details, never edits the registration (its email is the account and
 * payment identity) and never deletes it when the slot is refused.
 */

type Row = Record<string, unknown>;

function harness(tables: Record<string, Row[]>, bookingCreate: { status: number; body: Row }) {
  const writes: Array<{ table: string; op: string; payload?: unknown }> = [];
  const db = {
    auth: { getUser: async () => ({ data: { user: { email: "admin@example.test", email_confirmed_at: "2026-01-01" } } }) },
    from: (table: string) => {
      let rows = [...(tables[table] ?? [])];
      const query: Record<string, unknown> = {
        select: () => query,
        eq: (k: string, v: unknown) => { rows = rows.filter((r) => r[k] === v); return query; },
        neq: (k: string, v: unknown) => { rows = rows.filter((r) => r[k] !== v); return query; },
        in: (k: string, vs: unknown[]) => { rows = rows.filter((r) => vs.includes(r[k])); return query; },
        order: () => query,
        range: async () => ({ data: rows, error: null }),
        maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
        then: (resolve: (v: unknown) => void) => resolve({ data: rows, error: null }),
        insert: (payload: unknown) => { writes.push({ table, op: "insert", payload }); return Promise.resolve({ error: null }); },
        update: (payload: unknown) => { writes.push({ table, op: "update", payload }); return query; },
        delete: () => { writes.push({ table, op: "delete" }); return query; },
      };
      return query;
    },
  };
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(bookingCreate.body), { status: bookingCreate.status }));
  vi.stubGlobal("fetch", fetchMock);
  const handler = loadEdgeHandler("supabase/functions/admin-registrations/index.ts", {
    "https://esm.sh/@supabase/supabase-js@2": { createClient: () => db },
    "https://esm.sh/stripe@18.5.0": { default: class {} },
    "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
    "../_shared/booking.ts": {}, "../_shared/calendar-reconciliation.ts": {}, "../_shared/cohort-sessions.ts": {},
    "../_shared/refund.ts": {}, "../_shared/prices.ts": {},
    "../_shared/managed-email.ts": {}, "../_shared/registration-access.ts": {},
  }, { ADMIN_EMAILS: "admin@example.test", SUPABASE_URL: "https://db.example.test", SUPABASE_SERVICE_ROLE_KEY: "service" });
  const call = (body: unknown) => handler(new Request("https://example.test/admin", {
    method: "POST", headers: { Authorization: "Bearer test-admin", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  const bookingBody = () => JSON.parse(String((fetchMock.mock.calls[0] as unknown[] | undefined)?.[1] && ((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body)));
  return { call, writes, fetchMock, bookingBody };
}

const website: Row = {
  id: "reg-web", form_type: "private", name: "Ana Website", email: "account@example.test",
  contact_email: "contact@example.test", phone: "0700", quantity: 5, payment_status: "paid",
  lead_status: "converted", source: "form", anonymized_at: null, created_at: "2026-10-01",
};
const slot = { action: "book_for_student", registration_id: "reg-web", start_at: "2026-11-02T16:00:00.000Z", format: "online" };

afterEach(() => vi.unstubAllGlobals());

describe("book a lesson for an existing private student", () => {
  it("books on their registration with the stored details and creates nothing new", async () => {
    const h = harness({ registrations: [website] }, { status: 200, body: { ok: true } });
    const res = await h.call({ ...slot, student_name: "Typed Other", student_email: "typed@example.test" });
    expect(await res.json()).toMatchObject({ success: true, registration_id: "reg-web" });
    const sent = h.bookingBody();
    expect(sent).toMatchObject({ registration_id: "reg-web", student_name: "Ana Website", student_email: "contact@example.test", event_type: "paid" });
    expect(h.writes.filter((w) => w.table === "registrations")).toEqual([]);
  });

  it("never deletes their registration when the lesson is refused, and explains a used-up package", async () => {
    const h = harness({ registrations: [website] }, { status: 409, body: { error: "all paid lessons already booked", code: "lessons_used_up" } });
    const res = await h.call(slot);
    const out = await res.json();
    expect(out.code).toBe("lessons_used_up");
    expect(out.error).toContain("Toate lecțiile din pachet");
    expect(h.writes.filter((w) => w.table === "registrations")).toEqual([]);
  });

  it("refuses a registration that is not a private one", async () => {
    const h = harness({ registrations: [{ ...website, form_type: "group" }] }, { status: 200, body: { ok: true } });
    const out = await (await h.call(slot)).json();
    expect(out.error).toBe("Cursantul nu a fost găsit.");
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the new-student path: a fresh registration, removed again if the slot is refused", async () => {
    const h = harness({ registrations: [] }, { status: 409, body: { error: "slot just taken", code: "conflict" } });
    await h.call({ action: "book_for_student", student_name: "Nou Student", student_email: "nou@example.test", start_at: slot.start_at });
    const regWrites = h.writes.filter((w) => w.table === "registrations").map((w) => w.op);
    expect(regWrites).toEqual(["insert", "delete"]);
  });
});

describe("private_students list", () => {
  it("lists private students with lessons used, preferring the contact email", async () => {
    const h = harness({
      registrations: [website, { ...website, id: "reg-group", form_type: "group" }, { ...website, id: "reg-gone", anonymized_at: "2026-09-01" }],
      bookings: [
        { registration_id: "reg-web", event_type_slug: "paid", status: "confirmed" },
        { registration_id: "reg-web", event_type_slug: "paid", status: "completed" },
        { registration_id: "reg-web", event_type_slug: "paid", status: "cancelled" },
        { registration_id: "reg-web", event_type_slug: "trial", status: "completed" },
      ],
    }, { status: 200, body: {} });
    const out = await (await h.call({ action: "private_students" })).json();
    expect(out.data).toEqual([
      expect.objectContaining({ id: "reg-web", email: "contact@example.test", quantity: 5, lessons_used: 2, payment_status: "paid" }),
    ]);
  });
});

describe("booking dialog", () => {
  it("labels a student so two of them can be told apart", async () => {
    const { studentOptionLabel } = await import("@/components/BookingsAdmin");
    expect(studentOptionLabel({ id: "x", name: "Ana", email: "a@example.test", phone: null, quantity: 5, lessons_used: 2, payment_status: "paid", source: "form" }))
      .toBe("Ana — a@example.test · 2/5 lecții · plătit");
  });
});

describe("lecție în plus for an existing student", () => {
  it("creates a separate registration with the student's saved details and leaves their package alone", async () => {
    const h = harness({ registrations: [website] }, { status: 200, body: { ok: true } });
    const out = await (await h.call({ ...slot, extra: true, quantity: 1, paid: false, student_name: "Typed", student_email: "typed@example.test" })).json();
    expect(out.success).toBe(true);
    expect(out.registration_id).not.toBe("reg-web");
    const inserted = h.writes.find((w) => w.table === "registrations" && w.op === "insert")!.payload as Record<string, unknown>;
    expect(inserted).toMatchObject({ name: "Ana Website", email: "account@example.test", contact_email: "contact@example.test", phone: "0700", quantity: 1, payment_status: "unpaid", source: "admin" });
    expect(h.bookingBody()).toMatchObject({ registration_id: out.registration_id, student_email: "contact@example.test" });
    expect(h.writes.filter((w) => w.table === "registrations" && w.op !== "insert")).toEqual([]);
  });

  it("removes only the new registration if the extra lesson is refused", async () => {
    const h = harness({ registrations: [website] }, { status: 409, body: { error: "slot just taken", code: "conflict" } });
    await h.call({ ...slot, extra: true });
    expect(h.writes.filter((w) => w.table === "registrations").map((w) => w.op)).toEqual(["insert", "delete"]);
  });
});
