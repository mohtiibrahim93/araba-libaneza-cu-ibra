import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Owner, 27 Nov 2026: a lesson booked by hand chooses group or private, and a
// private lesson chooses its length (30, 60 or 90 min); a new student without
// a phone can be booked.
describe("hand-booked private lessons", () => {
  const dialog = readFileSync(
    "src/components/admin/BookLessonDialog.tsx",
    "utf8",
  );
  const manual = readFileSync(
    "src/components/admin/ManualStudentForm.tsx",
    "utf8",
  );
  const action = readFileSync(
    "supabase/functions/admin-registrations/index.ts",
    "utf8",
  );

  it("offers 30, 60, 90 or any length for every kind of lesson", () => {
    expect(dialog).toContain("[30, 60, 90].map");
    expect(dialog).toContain('id="bk-duration"');
    expect(dialog).toContain("bkDuration < 10 ||");
    // Hours + minutes, and the end time, set the same length.
    expect(dialog).toContain('aria-label="Ore"');
    expect(dialog).toContain('label="Ora de final"');
    expect(dialog).toContain("duration_min: bkDuration,");
    expect(dialog).not.toContain('bkKind === "trial" && (\n            <div');
  });

  it("lets the external sign-up choose group or private", () => {
    expect(manual).toContain('["group", "Curs în grupă"]');
    expect(manual).toContain('["private", "Lecție privată"]');
    expect(manual).toContain("<BookLessonDialog");
  });

  it("stores a blank phone as an empty string, never null", () => {
    expect(action).toContain('phone: studentPhone || "",');
    expect(action).not.toContain("phone: studentPhone || null,");
  });
});
