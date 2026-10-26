import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { code } from "./helpers/sourceText";
import {
  countsAgainstPackage,
  lessonsUsed,
  packageNumbers,
  packageTitle,
} from "../../supabase/functions/_shared/package-lessons";

/**
 * Owner's rules for private packages (26 October 2026): a lesson taken, a
 * no-show and a late cancellation by the student count; scuzat and a
 * cancellation more than 24h ahead do not. Numbers follow the date, and the
 * Google title is "Name - Araba libaneza- LX/Total".
 */
const read = (p: string) =>
  code(readFileSync(resolve(process.cwd(), p), "utf8"));
const lesson = (
  id: string,
  day: number,
  status = "confirmed",
  trial_outcome: string | null = null,
  event_type_slug = "paid",
) => ({
  id,
  start_at: `2026-11-${String(day).padStart(2, "0")}T10:00:00Z`,
  status,
  trial_outcome,
  event_type_slug,
});

describe("what counts against a package", () => {
  it("follows the owner's rule", () => {
    expect(countsAgainstPackage(lesson("a", 1))).toBe(true);
    expect(countsAgainstPackage(lesson("a", 1, "completed"))).toBe(true);
    expect(countsAgainstPackage(lesson("a", 1, "cancelled"))).toBe(false);
    expect(countsAgainstPackage(lesson("a", 1, "cancelled", "lost"))).toBe(
      true,
    );
    expect(countsAgainstPackage(lesson("a", 1, "completed", "excused"))).toBe(
      false,
    );
    expect(countsAgainstPackage(lesson("a", 1, "rescheduled"))).toBe(false);
    expect(
      countsAgainstPackage(lesson("a", 1, "confirmed", null, "trial")),
    ).toBe(false);
  });

  it("numbers the counted lessons by date", () => {
    const rows = [
      lesson("c", 9),
      lesson("a", 2, "completed"),
      lesson("x", 5, "cancelled"),
      lesson("b", 6, "cancelled", "lost"),
      lesson("e", 7, "confirmed", "excused"),
    ];
    const n = packageNumbers(rows);
    expect([n.get("a"), n.get("b"), n.get("c")]).toEqual([1, 2, 3]);
    expect(n.has("x")).toBe(false);
    expect(n.has("e")).toBe(false);
    expect(lessonsUsed(rows)).toBe(3);
  });

  it("writes the Google title the owner chose", () => {
    expect(packageTitle(" Ioan ", 3, 10)).toBe("Ioan - Araba libaneza- L3/10");
  });
});

describe("the rule is applied everywhere", () => {
  const create = read("supabase/functions/booking-create/index.ts");
  const admin = read("supabase/functions/admin-registrations/index.ts");
  const manage = read("supabase/functions/booking-manage/index.ts");

  it("caps bookings and counts lessons with it", () => {
    expect(create).toContain(code("if (lessonsUsed(packageRows) >= bought) {"));
    expect(admin).toContain(code("if (countsAgainstPackage(row))"));
  });

  it("titles a package lesson with its number and renumbers on changes", () => {
    expect(create).toContain(
      code("packageTitle(body.student_name, lessonNumber, packageTotal)"),
    );
    expect(
      manage.split(
        code("await syncPackageTitles(supabase, booking.registration_id);"),
      ).length,
    ).toBe(3);
    expect(admin).toContain(
      code("await syncPackageTitles(supabase, booking.registration_id);"),
    );
  });

  it("lets the owner mark a late cancellation as lost, never the student", () => {
    expect(manage).toContain(code("const cancelBody = internalCall(req)"));
    expect(manage).toContain(code('trial_outcome: "lost"'));
    expect(admin).toContain(code("late_by_student: lateByStudent"));
  });

  it("gives every admin lesson list its number", () => {
    expect(admin).toContain(
      code(
        "return jsonResponse({ data: await withPackageNumbers(data ?? []) });",
      ),
    );
    expect(admin).toContain(
      code("lessons: await withPackageNumbers(lessons ?? [])"),
    );
  });
});

describe("the package card and the low-package alert", () => {
  const admin = read("supabase/functions/admin-registrations/index.ts");
  const card = read("src/components/admin/PackageCard.tsx");
  const sheet = read("src/components/admin/PersonSheet.tsx");
  const today = read("src/components/admin/TodayAdmin.tsx");

  it("shows the package in a private student's sheet", () => {
    expect(admin).toContain(code('if (action === "package_lessons") {'));
    expect(sheet).toContain(code('{person.form_type === "private" && ('));
    expect(card).toContain(code('action: "package_lessons"'));
  });

  it("books the next lesson for the same student, and the next N weekly", () => {
    expect(card).toContain(code("studentId: pkg.registration_id"));
    expect(card).toContain(code('action: "book_for_student"'));
    // Only the first lesson of a series emails the student.
    expect(card).toContain(code("await bookRow(r, false, !first)"));
    expect(admin).toContain(code("quiet: b.quiet === true"));
  });

  it("warns on Acasă when a package is about to run out", () => {
    expect(admin).toContain(code("if (left > 1) continue;"));
    expect(admin).toContain(code("lowPackages,"));
    expect(today).toContain(code("Pachete aproape terminate"));
  });
});
