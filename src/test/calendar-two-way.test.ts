import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeModule } from "./helpers/edge-handler";
import { code } from "./helpers/sourceText";

/**
 * Owner's request (13 October 2026): the calendar works both ways, for
 * private lessons and for groups — added, moved or removed on either side.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const mod = () =>
  loadEdgeModule(
    "supabase/functions/_shared/calendar-reconciliation.ts",
    {},
  ) as any;
const config = {
  lovableKey: "synthetic",
  calendarKey: "synthetic",
  from: "2026-10-06T00:00:00Z",
  to: "2026-11-30T00:00:00Z",
};
const owner = { email: "owner@example.test", organizer: true, self: true };

function database() {
  const writes: Array<{ table: string; op: string; payload: any }> = [];
  const tables: Record<string, any[]> = {
    group_cohorts: [
      { id: "g-a2", is_active: true, status: "confirmed" },
      { id: "g-old", is_active: true, status: "completed" },
    ],
    cohort_calendar: [
      { cohort_id: "g-a2", calendar_title: "Adulti- A2- Grupa 1- Libaneza" },
      { cohort_id: "g-old", calendar_title: "Curs vechi" },
    ],
  };
  return {
    writes,
    from: (table: string) => {
      let pending: any = null;
      const q: any = {
        select: () => q,
        order: () => q,
        range: () => q,
        eq: () => q,
        is: () => q,
        or: () => q,
        limit: async () => ({ data: [], error: null }),
        upsert: (payload: any) => {
          writes.push({ table, op: "upsert", payload });
          pending = payload;
          return q;
        },
        insert: (payload: any) => {
          writes.push({ table, op: "insert", payload });
          pending = payload;
          return q;
        },
        single: async () => ({ data: { id: "b" }, error: null }),
        then: (resolve: any) =>
          resolve({
            data: pending ? null : (tables[table] ?? []),
            error: null,
          }),
      };
      return q;
    },
  };
}
const google = (items: any[]) => async () => Response.json({ items });

describe("Google → site", () => {
  it("adds a new lesson of a running group, before the private-lesson rule can claim it", async () => {
    const db = database();
    const out = await mod().reconcileCalendar(
      db,
      config,
      google([
        {
          id: "ev-l13",
          summary: "Adulti- A2- Grupa 1- Libaneza-L13 (araba libaneza)",
          attendees: [owner, { email: "student@example.test" }],
          start: { dateTime: "2026-10-20T19:00:00+03:00" },
          end: { dateTime: "2026-10-20T20:30:00+03:00" },
        },
      ]),
    );
    expect(out.imported).toBe(1);
    expect(db.writes.map((w) => w.table)).toEqual(["cohort_sessions"]);
    expect(db.writes[0]!.payload).toMatchObject({
      cohort_id: "g-a2",
      lesson_number: 13,
      google_event_id: "ev-l13",
      starts_at: "2026-10-20T16:00:00.000Z",
    });
  });

  it("ignores the names of finished groups", async () => {
    const db = database();
    const out = await mod().reconcileCalendar(
      db,
      config,
      google([
        {
          id: "ev-old",
          summary: "Curs vechi - L3",
          attendees: [owner],
          start: { dateTime: "2026-10-20T19:00:00+03:00" },
          end: { dateTime: "2026-10-20T20:00:00+03:00" },
        },
      ]),
    );
    expect(db.writes).toEqual([]);
    expect(out.imported).toBe(0);
  });

  it("still removes a lesson deleted in Google (cancelled events are read)", () => {
    const src = read("supabase/functions/_shared/calendar-reconciliation.ts");
    expect(src).toContain('showDeleted: "true"');
    expect(code(src)).toContain(
      code(
        'await update({ status: "cancelled", cancelled_at: new Date().toISOString(), google_sync_error: null });',
      ),
    );
    expect(code(src)).toContain(
      code('db.from("cohort_sessions").delete().eq("id", session.id)'),
    );
  });
});

describe("site → Google", () => {
  const admin = read("supabase/functions/admin-registrations/index.ts");
  it("moves or removes one group lesson in Google first, then on the site", () => {
    const all = code(admin);
    const action = all.slice(
      all.indexOf(
        code(
          'if (action === "move_cohort_session" || action === "delete_cohort_session")',
        ),
      ),
      all.indexOf(code('if (action === "delete_cohort_calendar")')),
    );
    expect(action).toContain(code('{ method: "DELETE", headers: gHeaders }'));
    expect(action).toContain(code('method: "PATCH"'));
    expect(action.indexOf(code('method: "PATCH"'))).toBeLessThan(
      action.indexOf(code(".update({ starts_at: start, ends_at: end")),
    );
    expect(action).toContain(code("Nimic nu s-a schimbat."));
  });
  it("deleting a registration removes its lessons from Google too, or deletes nothing", () => {
    const all = code(admin);
    const del = all.slice(
      all.indexOf(code('if (action === "delete" && Array.isArray(ids)')),
      all.indexOf(code('if (action === "anonymize"')),
    );
    expect(del).toContain(
      code(
        '.from("bookings").select("id, google_event_id").in("registration_id", deletable).eq("status", "confirmed")',
      ),
    );
    expect(del).toContain(code("?sendUpdates=none"));
    expect(del.indexOf(code('method: "DELETE"'))).toBeLessThan(
      del.indexOf(code('.from("registrations").delete()')),
    );
    expect(del).toContain(code("Nimic nu s-a șters."));
  });
  it("offers Mută / Șterge on each group lesson of the week", () => {
    expect(code(read("src/components/admin/WeekLessons.tsx"))).toContain(
      code("<GroupSessionActions session={g}"),
    );
    const ui = read("src/components/admin/GroupSessionActions.tsx");
    expect(code(ui)).toContain(code('action: "move_cohort_session"'));
    expect(ui).toContain('action: "delete_cohort_session"');
    expect(ui).toContain("bucharestCivilToUtc(");
  });
});
