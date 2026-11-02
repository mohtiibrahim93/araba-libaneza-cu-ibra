import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Owner, 2 Nov 2026: a trial booked by hand in admin is a free trial, not a
// paid private lesson (a trial on 27 Oct had been recorded as paid revenue).
describe("manual booking can be a free trial", () => {
  const server = readFileSync(
    "supabase/functions/admin-registrations/index.ts",
    "utf8",
  );
  const action = server.slice(server.indexOf('action === "book_for_student"'));

  it("creates its own trial registration that owes nothing", () => {
    expect(action).toContain('form_type: trial ? "trial" : "private"');
    expect(action).toMatch(/payment_status: trial\s*\?\s*"unpaid"/);
    expect(action).toContain(
      "const onExisting = existing !== null && !extra && !trial;",
    );
  });

  it("books the trial lesson type", () => {
    expect(action).toContain('event_type: trial ? "trial" : "paid"');
  });

  it("the form offers it and sends it", () => {
    const form = readFileSync(
      "src/components/admin/BookLessonDialog.tsx",
      "utf8",
    );
    expect(form).toContain('["trial", "Probă gratuită"]');
    expect(form).toContain("trial: true, duration_min: bkDuration");
  });
});

describe("a bonus lesson never counts in the package", () => {
  it("is not counted, booked or marked", async () => {
    const { countsAgainstPackage } =
      await import("../../supabase/functions/_shared/package-lessons");
    expect(
      countsAgainstPackage({
        id: "b",
        start_at: "2026-11-05T10:00:00Z",
        status: "confirmed",
        event_type_slug: "paid",
        trial_outcome: "bonus",
      }),
    ).toBe(false);
  });

  it("is stored as the bonus outcome and skips the package cap", () => {
    const create = readFileSync(
      "supabase/functions/booking-create/index.ts",
      "utf8",
    );
    expect(create).toContain(
      "const bonus = internalCall && body.bonus === true;",
    );
    expect(create).toContain('trial_outcome: "bonus"');
  });

  it("can be marked later, also before the lesson, and the database accepts it", () => {
    const admin = readFileSync(
      "supabase/functions/admin-registrations/index.ts",
      "utf8",
    );
    expect(admin).toMatch(/\["excused", "lost", "bonus"\]/);
    const sql = readFileSync(
      "supabase/migrations/20261102210000_lesson_outcome_bonus.sql",
      "utf8",
    );
    expect(sql).toContain("'bonus'");
  });
});
