import { describe, expect, it } from "vitest";
import { loadEdgeModule } from "./helpers/edge-handler";

/**
 * Owner, 1 Nov 2026: a private lesson put in Google at a past date was imported
 * as done, then moved a week later minutes after the import. The sync skipped
 * lessons already done, so it kept the old date and the package numbers went
 * wrong. A done lesson now follows its Google event when it moves.
 */
function database(row: Record<string, unknown>) {
  const rows: any[] = [
    {
      id: "b",
      registration_id: "r",
      event_type_slug: "paid",
      google_event_id: "e",
      google_sync_error: null,
      student_name: "Student",
      student_email: "student@example.test",
      student_phone: null,
      ...row,
    },
  ];
  return {
    rows,
    from: (table: string) => {
      const filters: [string, unknown][] = [];
      let patch: any;
      const q: any = {
        select: () => q,
        order: () => q,
        range: () => q,
        limit: () => q,
        or: () => q,
        is: (k: string, v: unknown) => {
          filters.push([k, v]);
          return q;
        },
        eq: (k: string, v: unknown) => {
          filters.push([k, v]);
          return q;
        },
        update: (p: any) => {
          patch = p;
          return q;
        },
        then: (resolve: any) => {
          const source = table === "bookings" ? rows : [];
          const selected = source.filter((r) =>
            filters.every(([k, v]) => r[k] === v),
          );
          if (patch) selected.forEach((r) => Object.assign(r, patch));
          return Promise.resolve({
            data: selected.map((r) => ({ ...r })),
            error: null,
          }).then(resolve);
        },
      };
      return q;
    },
  };
}

const sync = () =>
  (
    loadEdgeModule(
      "supabase/functions/_shared/calendar-reconciliation.ts",
      {},
    ) as any
  ).reconcileCalendar;

const google = (event: any) => {
  const methods: Array<string | undefined> = [];
  const request = async (_url: string, init: any) => {
    methods.push(init?.method);
    return Response.json({ items: [event] });
  };
  return { methods, request };
};

const config = (from: string, to: string) => ({
  lovableKey: "synthetic",
  calendarKey: "synthetic",
  from,
  to,
});

describe("a lesson already done follows its moved Google event", () => {
  it("moved into the future: new time and a lesson to come again", async () => {
    const db = database({
      status: "completed",
      completed_at: "2026-10-25T15:30:00Z",
      completed_by: "auto",
      start_at: "2026-10-25T14:00:00Z",
      end_at: "2026-10-25T15:30:00Z",
    });
    const g = google({
      id: "e",
      status: "confirmed",
      start: { dateTime: "2099-11-01T16:00:00+02:00" },
      end: { dateTime: "2099-11-01T17:30:00+02:00" },
    });
    const out = await sync()(
      db,
      config("2026-10-01T00:00:00Z", "2100-01-01T00:00:00Z"),
      g.request,
    );
    expect(out.updated).toBe(1);
    expect(out.errors).toEqual([]);
    expect(db.rows[0]).toMatchObject({
      start_at: "2099-11-01T14:00:00.000Z",
      end_at: "2099-11-01T15:30:00.000Z",
      status: "confirmed",
      completed_at: null,
      completed_by: null,
    });
    // Nothing is written to Google.
    expect(g.methods.every((m) => m === undefined)).toBe(true);
  });

  it("moved to another past time: new time, still done", async () => {
    const db = database({
      status: "completed",
      completed_at: "2026-10-20T10:00:00Z",
      completed_by: "auto",
      start_at: "2026-10-18T08:00:00Z",
      end_at: "2026-10-18T09:30:00Z",
    });
    const g = google({
      id: "e",
      status: "confirmed",
      start: { dateTime: "2026-10-19T11:00:00+03:00" },
      end: { dateTime: "2026-10-19T12:30:00+03:00" },
    });
    const out = await sync()(
      db,
      config("2026-10-01T00:00:00Z", "2026-11-01T00:00:00Z"),
      g.request,
    );
    expect(out.updated).toBe(1);
    expect(db.rows[0]).toMatchObject({
      start_at: "2026-10-19T08:00:00.000Z",
      status: "completed",
      completed_by: "auto",
    });
  });

  it("an unmoved or deleted past lesson is left alone", async () => {
    for (const event of [
      {
        id: "e",
        status: "confirmed",
        start: { dateTime: "2026-10-18T11:00:00+03:00" },
        end: { dateTime: "2026-10-18T12:30:00+03:00" },
      },
      { id: "e", status: "cancelled" },
    ]) {
      const db = database({
        status: "completed",
        start_at: "2026-10-18T08:00:00Z",
        end_at: "2026-10-18T09:30:00Z",
      });
      const out = await sync()(
        db,
        config("2026-10-01T00:00:00Z", "2026-11-01T00:00:00Z"),
        google(event).request,
      );
      expect(out.updated).toBe(0);
      expect(db.rows[0]).toMatchObject({
        status: "completed",
        start_at: "2026-10-18T08:00:00Z",
      });
    }
  });
});
