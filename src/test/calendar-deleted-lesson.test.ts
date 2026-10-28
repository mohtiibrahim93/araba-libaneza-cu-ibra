import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeModule } from "./helpers/edge-handler";

/**
 * A lesson deleted in the owner's Google Calendar (owner's rule, 27 October
 * 2026): it is cancelled here, the student is emailed in their language that
 * the lesson was cancelled, the owner is told, and nothing is refunded.
 */
function database(startAt: string) {
  const rows: any[] = [
    {
      id: "b1",
      google_event_id: "e1",
      registration_id: "r1",
      event_type_slug: "paid",
      start_at: startAt,
      end_at: new Date(Date.parse(startAt) + 3_600_000).toISOString(),
      status: "confirmed",
      student_email: "student@example.test",
      student_name: "Ana",
      student_phone: "+40700000000",
      google_contact_email: "student@example.test",
      google_sync_error: null,
      format: "online",
      language: "en",
    },
  ];
  return {
    rows,
    from: (table: string) => {
      const filters: [string, unknown][] = [];
      let patch: any;
      const q: any = {
        is: (k: string, v: unknown) => (filters.push([k, v]), q),
        eq: (k: string, v: unknown) => (filters.push([k, v]), q),
        select: () => q,
        order: () => q,
        range: () => q,
        update: (p: any) => ((patch = p), q),
        then: (done: any) => {
          const source = table === "bookings" ? rows : [];
          const hit = source.filter((r) =>
            filters.every(([k, v]) => r[k] === v),
          );
          if (patch) hit.forEach((r) => Object.assign(r, patch));
          return Promise.resolve({
            data: hit.map((r) => ({ ...r })),
            error: null,
          }).then(done);
        },
      };
      return q;
    },
  };
}

const reconcile = () =>
  (
    loadEdgeModule(
      "supabase/functions/_shared/calendar-reconciliation.ts",
      {},
    ) as any
  ).reconcileCalendar;

const config = (from: number, to: number) => ({
  lovableKey: "synthetic",
  calendarKey: "synthetic",
  from: new Date(from).toISOString(),
  to: new Date(to).toISOString(),
});

describe("a lesson deleted in Google Calendar", () => {
  it("is cancelled and handed back for the emails when it is still to come", async () => {
    const start = Date.now() + 3 * 86_400_000;
    const db = database(new Date(start).toISOString());
    const out = await reconcile()(
      db,
      config(Date.now() - 86_400_000, start + 86_400_000),
      async () => Response.json({ items: [{ id: "e1", status: "cancelled" }] }),
    );
    expect(db.rows[0].status).toBe("cancelled");
    expect(out.cancelledInGoogle).toEqual([
      expect.objectContaining({
        id: "b1",
        student_email: "student@example.test",
        language: "en",
      }),
    ]);
  });

  it("is not announced when it had already taken place", async () => {
    const start = Date.now() - 2 * 86_400_000;
    const db = database(new Date(start).toISOString());
    const out = await reconcile()(
      db,
      config(start - 86_400_000, Date.now() + 86_400_000),
      async () => Response.json({ items: [{ id: "e1", status: "cancelled" }] }),
    );
    expect(db.rows[0].status).toBe("cancelled");
    expect(out.cancelledInGoogle).toEqual([]);
  });

  it("emails the student in their language and the owner, with no refund", async () => {
    const sent: Array<{ kind: string; to?: string; data: any }> = [];
    const mod = loadEdgeModule(
      "supabase/functions/_shared/calendar-cancel-emails.ts",
      {
        "./booking-emails.ts": {
          fmtBookingLocal: (iso: string, lang: string) => `${lang}:${iso}`,
          sendBookingEmail: async (template: string, to: string, data: any) => {
            sent.push({ kind: template, to, data });
          },
          sendAdminBookingEmail: (action: string, data: any) => {
            sent.push({ kind: `admin-${action}`, data });
          },
        },
      },
    ) as any;
    await mod.notifyGoogleCancellations([
      {
        id: "b1",
        event_type_slug: "paid",
        start_at: "2026-11-05T16:00:00Z",
        student_name: "Ana",
        student_email: "student@example.test",
        student_phone: null,
        format: "online",
        language: "en",
      },
    ]);
    expect(sent[0]).toMatchObject({
      kind: "booking-cancelled",
      to: "student@example.test",
      data: {
        lang: "en",
        byTeacher: true,
        whenLabel: "en:2026-11-05T16:00:00Z",
      },
    });
    expect(sent[1]!.kind).toBe("admin-cancelled");
    expect(sent[1]!.data.notes).toContain("Nu s-a făcut nicio rambursare");
    // Nothing here touches money.
    const src = readFileSync(
      resolve(
        process.cwd(),
        "supabase/functions/_shared/calendar-cancel-emails.ts",
      ),
      "utf8",
    );
    expect(src).not.toMatch(/refunds\.create|stripe/i);
  });

  it("is wired into both the scheduled sync and the admin's sync button", () => {
    for (const fn of ["calendar-sync", "admin-registrations"]) {
      const src = readFileSync(
        resolve(process.cwd(), `supabase/functions/${fn}/index.ts`),
        "utf8",
      );
      expect(src).toContain(
        "await notifyGoogleCancellations(result.cancelledInGoogle);",
      );
    }
  });

  it("the email says the teacher cancelled it, in RO and EN", () => {
    const tpl = readFileSync(
      resolve(
        process.cwd(),
        "supabase/functions/_shared/transactional-email-templates/booking-cancelled.tsx",
      ),
      "utf8",
    );
    expect(tpl).toContain("Lecția ta a fost anulată de profesor.");
    expect(tpl).toContain("Your lesson was cancelled by the teacher.");
  });
});
