import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Task 10 follow-ups approved by the owner on 13 October 2026. */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("reminders are stamped only once they went out", () => {
  const src = read("supabase/functions/booking-reminders/index.ts");
  const loop = src.slice(src.indexOf("for (const r of rowsTyped)"), src.lastIndexOf("return { stage: stage.key"));
  it("awaits the send and skips the stamp when it fails", () => {
    expect(loop).toContain('await sendTemplateEmail("booking-reminder"');
    expect(loop.indexOf("continue;")).toBeLessThan(loop.indexOf("[stage.flag]: new Date().toISOString()"));
    expect(loop).toContain("idempotencyKey: `booking-reminder-${stage.key}-${r.id}`");
  });
});

describe("a refunded registration with lessons still booked", () => {
  it("is listed in Azi for the owner, never cancelled automatically", () => {
    const admin = read("supabase/functions/admin-registrations/index.ts");
    const today = admin.slice(admin.indexOf('if (action === "list_today")'));
    expect(today).toContain('.eq("payment_status", "refunded")');
    expect(today).toContain("refundedLessons,");
    expect(today.slice(0, today.indexOf("refundedLessons,"))).not.toContain('status: "cancelled"');
    expect(read("src/components/admin/TodayAdmin.tsx")).toContain("Plată rambursată, dar lecția e încă programată");
  });
});
