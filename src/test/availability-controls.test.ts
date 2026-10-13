import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { inBlackout, physicalDayAllowed, rulesForEventType, LEVEL_CHECK_RULES } from "../../supabase/functions/_shared/schedule-rules";

/** Owner's request (13 October 2026): every availability rule editable in admin. */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const general = [{ weekday: 6, start_time: "10:00:00", end_time: "18:00:00", event_type_slug: null }];
const levelOwn = [{ weekday: 1, start_time: "12:00:00", end_time: "13:00:00", event_type_slug: "verificare-nivel" }];

describe("hours per lesson type", () => {
  it("uses a type's own hours when it has any, the general ones otherwise", () => {
    expect(rulesForEventType([...general, ...levelOwn], "verificare-nivel")).toEqual(levelOwn);
    expect(rulesForEventType([...general, ...levelOwn], "trial")).toEqual(general);
  });
  it("keeps the level check's built-in hour on a database without per-type rules", () => {
    expect(rulesForEventType(general, "verificare-nivel", LEVEL_CHECK_RULES)).toEqual(LEVEL_CHECK_RULES);
  });
});

describe("in-person days per lesson type", () => {
  const sat = "2026-11-14T10:00:00.000Z", wed = "2026-11-11T10:00:00.000Z";
  it("follows the days chosen in admin; null means any day; online is never limited", () => {
    expect(physicalDayAllowed({ slug: "trial", physical_weekdays: [0, 6] }, "physical", wed)).toBe(false);
    expect(physicalDayAllowed({ slug: "trial", physical_weekdays: [0, 6] }, "physical", sat)).toBe(true);
    expect(physicalDayAllowed({ slug: "trial", physical_weekdays: null }, "physical", wed)).toBe(true);
    expect(physicalDayAllowed({ slug: "trial", physical_weekdays: [6] }, "online", wed)).toBe(true);
  });
  it("falls back to the old weekend rule for the trial when the column is missing", () => {
    expect(physicalDayAllowed({ slug: "trial" }, "physical", wed)).toBe(false);
    expect(physicalDayAllowed({ slug: "paid" }, "physical", wed)).toBe(true);
  });
});

describe("days off", () => {
  it("cover whole Romanian calendar days, inclusive", () => {
    const off = [{ start_date: "2026-12-24", end_date: "2026-12-26" }];
    expect(inBlackout("2026-12-23T21:30:00.000Z", off)).toBe(false); // 23 Dec 23:30 in Bucharest
    expect(inBlackout("2026-12-23T22:30:00.000Z", off)).toBe(true); // 24 Dec 00:30 in Bucharest
    expect(inBlackout("2026-12-26T21:30:00.000Z", off)).toBe(true); // 26 Dec 23:30 in Bucharest
    expect(inBlackout("2026-12-26T22:30:00.000Z", off)).toBe(false); // 27 Dec 00:30 in Bucharest
    expect(inBlackout("2026-12-26T12:00:00.000Z", off)).toBe(true);
  });
});

describe("enforced everywhere a time is offered or taken", () => {
  it("availability, booking and reschedule read the same rules", () => {
    for (const f of ["booking-availability", "booking-create", "booking-manage"]) {
      const src = read(`supabase/functions/${f}/index.ts`);
      expect(src, f).toContain("rulesForEventType(");
      expect(src, f).toContain('from("availability_blackouts")');
    }
    expect(read("supabase/functions/booking-create/index.ts")).toContain("!internalCall && inBlackout(startISO, daysOff ?? [])");
    expect(read("supabase/functions/_shared/booking.ts")).toContain("return physicalDayAllowed(et, format, iso);");
  });
  it("migration moves the fixed rules into editable data", () => {
    const sql = read("supabase/migrations/20261013160000_availability_controls.sql");
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS event_type_slug text");
    expect(sql).toContain("UPDATE public.booking_event_types SET physical_weekdays = '{0,6}' WHERE slug = 'trial'");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.availability_blackouts");
  });
  it("admin offers the preview, per-type limits and days off", () => {
    const ui = read("src/components/admin/BookingSettingsAdmin.tsx");
    expect(ui).toContain("Ce vede vizitatorul");
    expect(ui).toContain('action: "update_event_type_rules"');
    expect(ui).toContain('action: "add_blackout"');
    expect(read("src/pages/Admin.tsx")).toContain("<BookingSettingsAdmin />");
  });
});
