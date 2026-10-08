import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Three complaints from the live panel on 2026-10-08, all of them the screen
 * contradicting what the owner had already done or could already see.
 *
 * 1. "Înscrieri" counted 6 of 7 and the seventh was nowhere. The numerator was
 *    the filtered list, which deliberately hides a trial abandoned before a
 *    slot was chosen; the denominator was the raw row count, which does not.
 *    The missing person was real — an "incomplete" row — but the list refuses
 *    to show it and nothing said so.
 * 2. Azi asked him to contact two people he had already contacted and marked.
 *    Being contacted is recorded two ways: whatsapp_sent_at, set by the
 *    WhatsApp button, and lead_status, which he sets by hand. Azi read only the
 *    first, so marking someone "Contactat" never silenced it.
 * 3. Azi offered a person who could not be found in "Înscrieri" at all — the
 *    same "incomplete" row, counted in one place and hidden in the other.
 */
const fn = readFileSync(
  resolve(process.cwd(), "supabase/functions/admin-registrations/index.ts"),
  "utf8",
);
const admin = readFileSync(resolve(process.cwd(), "src/pages/Admin.tsx"), "utf8");

const listToday = (() => {
  const at = fn.indexOf('action === "list_today"');
  expect(at, "list_today is gone").toBeGreaterThan(-1);
  const next = fn.indexOf('action === "', at + 20);
  return fn.slice(at, next === -1 ? fn.length : next);
})();

describe("Azi only asks for work that is still outstanding", () => {
  it("treats a triaged lead as handled, however it was triaged", () => {
    // Anything but "new" or "incomplete" means a decision was made.
    expect(listToday).toContain("lead_status.is.null,lead_status.in.(new,incomplete)");
  });

  it("still reads the WhatsApp timestamp, so either way of recording counts", () => {
    expect(listToday).toContain('.is("whatsapp_sent_at", null)');
  });

  it("asks whether the sync is broken now, not whether it ever broke", () => {
    // The health screen keeps 180 days of history on purpose. Repeating it here
    // would print the same unfixable warning every morning until it aged out,
    // and a warning that never clears is one you stop reading.
    const at = listToday.indexOf('.is("google_event_id", null)');
    expect(at, "the backlog count is gone").toBeGreaterThan(-1);
    const window = listToday.slice(at, at + 1200);
    expect(window).toContain("30 * 86_400_000");
    expect(window).not.toContain("180 * 86_400_000");
  });
});

describe("the Înscrieri count matches what the list can show", () => {
  it("counts the same universe above and below the line", () => {
    // stats.total already excludes the abandoned trials the list hides.
    expect(admin).toContain("{filteredRegistrations.length}/{stats.total}");
    expect(admin).not.toContain("{filteredRegistrations.length}/{registrations.length}");
  });

  it("gives the sidebar badge the same number as the heading", () => {
    expect(admin).toContain("badge: stats.total,");
    expect(admin).not.toContain("badge: registrations.length,");
  });

  it("offers a way to the rows it hides, instead of leaving a gap", () => {
    // A hidden row the owner cannot reach is what made the seventh person a
    // mystery; the count now says how many and takes him to them.
    expect(admin).toContain('setLeadStatusFilter("incomplete")');
    expect(admin).toContain("stats.incomplete > 0");
  });
});
