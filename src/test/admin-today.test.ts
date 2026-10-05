import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The screen the admin panel opens on.
 *
 * It used to show four all-time totals and two all-time funnels. Nobody opens
 * an admin panel to learn how many registrations there have ever been, and
 * once the Analiză tab existed that was also a second, worse answer to a
 * question it handles properly — with no time window at all.
 *
 * "Azi" is a worklist instead. What is asserted here is mostly the honesty of
 * it, because the ways this screen can go wrong are ways it quietly stops
 * being trustworthy:
 *
 *   - Counting a free trial as an unpaid course, so the list of people who owe
 *     money is wrong and the owner stops believing it.
 *   - Computing seat fill a second time, which would eventually disagree with
 *     the Grupe screen about the same cohort.
 *   - Taking "today" from UTC, so at 01:00 local in summer the 09:00 lesson is
 *     on yesterday's list and vanishes from the one being read at breakfast.
 *   - Listing newest-first, which buries the person who has waited longest.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("the Azi worklist", () => {
  const fn = read("supabase/functions/admin-registrations/index.ts");
  const page = read("src/components/admin/TodayAdmin.tsx");
  const admin = read("src/pages/Admin.tsx");

  const actionWithComments = fn.slice(
    fn.indexOf('if (action === "list_today")'),
    fn.indexOf("// ============ Analytics over a time window ============"),
  );
  const action = actionWithComments
    // The comments explain which calculations this deliberately does NOT do,
    // and name them — so a check for "does it query X" has to read code only.
    .split("\n")
    .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*") && !l.trim().startsWith("/*"))
    .join("\n");

  it("has an action that returns work, not totals", () => {
    expect(action.length).toBeGreaterThan(500);
    expect(actionWithComments.length).toBeGreaterThan(action.length);
    for (const key of ["lessons", "uncontacted", "unpaid", "cohortsStartingSoon", "problems"]) {
      expect(action, `${key} missing from the worklist`).toContain(key);
    }
  });

  it("starts the day at local midnight, not UTC midnight", () => {
    expect(action).toContain("utcToZonedParts");
    expect(action).toContain("zonedToUtc(p.year, p.month, p.day, 0, 0)");
  });

  it("does not bill anyone for a free trial", () => {
    // Only the course types that carry money can be "unpaid".
    expect(action).toContain('.in("form_type", ["group", "private", "kids"])');
    expect(action).toContain('.not("payment_status", "in", \'("paid","refunded")\')');
  });

  it("puts the longest wait first", () => {
    // Both people-lists sort oldest-first, which is the opposite of how a lead
    // list usually sorts itself.
    const ascending = [...action.matchAll(/ascending: true/g)].length;
    expect(ascending).toBeGreaterThanOrEqual(3);
    expect(action).toContain("waitingDays");
  });

  it("leaves erased people out", () => {
    const anonymized = [...action.matchAll(/anonymized_at", null/g)].length;
    expect(anonymized, "a GDPR-erased row would reappear on the worklist").toBeGreaterThanOrEqual(2);
  });

  it("does not compute seat fill a second time", () => {
    // Grupe owns that calculation, including the manual offset.
    expect(action).not.toContain("group_capacities");
    expect(action).not.toContain("manual_offset");
    expect(page).toContain("Locurile ocupate se văd în Grupe");
  });

  it("is bounded in every direction", () => {
    // A worklist that grows without end is a report.
    expect(action).toContain(".limit(50)");
    expect(action).toContain("staleAfter");
    expect(action).toContain("horizon");
  });

  it("writes nothing", () => {
    for (const w of [".insert(", ".update(", ".delete(", ".upsert("]) {
      expect(action, `the worklist must be read-only, found ${w}`).not.toContain(w);
    }
  });

  it("says so when there is nothing to do", () => {
    // An empty worklist is a good morning, not a page that failed to load.
    expect(page).toContain("nothingToDo");
    expect(page).toContain("Nimic de rezolvat acum");
  });

  it("is what the panel opens on", () => {
    expect(admin).toContain("<TodayAdmin");
    expect(admin).toContain('useState("today")');
  });

  it("kept the private-lead filter when the old home screen went", () => {
    // PrivateLeadStats lived on the old home screen; it is a filter shortcut
    // for the registrations table, so it moved above that table rather than
    // being dropped. The nav test caught this when it was dropped.
    expect(admin).toContain("<PrivateLeadStats");
    const stats = admin.indexOf("<PrivateLeadStats");
    const table = admin.indexOf("<RegistrationsTable");
    expect(stats).toBeGreaterThan(-1);
    expect(table).toBeGreaterThan(stats);
  });
});
