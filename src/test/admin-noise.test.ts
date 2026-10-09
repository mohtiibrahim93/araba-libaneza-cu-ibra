import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Four things the admin said that were not true, or said in the database's
 * words rather than the owner's. Each was found by reading the real panel
 * rather than the code, and each is small on its own; together they are most
 * of what made the busiest screens hard to trust.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("the admin does not raise alarms it cannot justify", () => {
  it("waits until bookings are known before saying a trial has no slot", () => {
    // The set fills in asynchronously, so an empty set meant both "no booking"
    // and "not asked yet". For the first moment after the tab opened, every
    // trial was accused of never picking a slot -- six false alarms at once.
    const src = read("src/components/admin/RegistrationsTable.tsx");
    expect(src).toContain("bookingsKnown");
    expect(src).toContain('r.form_type === "trial" && bookingsKnown && !bookedRegIds.has(r.id)');
  });

  it("leaves the flag off when bookings cannot be loaded at all", () => {
    // Failure must read as "unknown", never as "nobody booked".
    const src = read("src/components/admin/RegistrationsTable.tsx");
    // Scope to the bookings effect; the file has several try/catch blocks.
    const start = src.indexOf('action: "list_bookings"');
    expect(start, "the bookings fetch is gone").toBeGreaterThan(-1);
    const block = src.slice(start, start + 900);
    const set = block.indexOf("setBookingsKnown(true)");
    const cat = block.indexOf("} catch {");
    expect(set, "the flag is never set in this effect").toBeGreaterThan(-1);
    expect(cat, "the catch is gone").toBeGreaterThan(-1);
    expect(set, "it must be set on success, before the catch").toBeLessThan(cat);
  });
});

describe("the admin offers filters that lead somewhere", () => {
  it("shows only lead statuses that have someone in them", () => {
    // Eight statuses and six private leads meant a wall of zeros above the
    // table; a zero-count filter just shows an empty list when clicked.
    const src = read("src/components/admin/PrivateLeadStats.tsx");
    expect(src).toContain("LEAD_STATUSES.filter((status) => counts[status] > 0)");
  });
});

describe("the admin speaks Romanian, not JSON", () => {
  it("describes an audit entry instead of serialising it", () => {
    const src = read("src/components/admin/AuditLogAdmin.tsx");
    expect(src).toContain("describeDetails(r.details)");
    expect(src, "the raw object must not reach the screen").not.toContain(
      "JSON.stringify(r.details)",
    );
  });

  it("names a status change with the labels the rest of the panel uses", () => {
    const src = read("src/components/admin/AuditLogAdmin.tsx");
    expect(src).toContain("leadStatusLabels");
    expect(src).toContain('"from" in d && "to" in d');
  });
});

describe("visitor chrome stays off the admin", () => {
  it("keeps the course assistant out, as before", () => {
    const src = read("src/routes/__root.tsx");
    expect(src).toContain("isAdmin ? null : <AskAssistant />");
  });

  it("no longer marks the document for a rule that is now global", () => {
    // The badge is hidden on every route (see recaptcha-badge.test.ts), so
    // the data-admin-chrome flag had nothing reading it. A component that
    // exists for a side effect nobody observes is worse than no component.
    const src = read("src/routes/__root.tsx");
    expect(src).not.toContain("adminChrome");
    expect(src).not.toContain("AdminChromeMarker");
    expect(read("src/styles.css")).not.toContain("data-admin-chrome");
  });
});

describe("the admin reads in both themes and at both widths", () => {
  it("gives payment badges colours that survive dark mode", () => {
    // They were written for a light panel: fixed -100/-200 fills with dark
    // text, which in dark mode are bright blocks of near-white.
    const src = read("src/components/admin/RegistrationsTable.tsx");
    // Reject a fixed shade; an opacity form like bg-red-500/10 is fine in
    // both themes, so the lookahead must not stop mid-number.
    const lightOnly = src.match(/bg-(?:gray|green|yellow|red|blue)-[0-9]{2,3}(?![0-9/])/g) ?? [];
    expect(lightOnly, `light-only badge fills left: ${lightOnly.join(", ")}`).toEqual([]);
  });

  it("lets a title wrap on a phone instead of clipping it", () => {
    // 23 articles all clipped to "Siriaca din ..." is a list you cannot read.
    for (const f of ["src/components/admin/BlogAdmin.tsx", "src/components/admin/PagesAdmin.tsx"]) {
      expect(read(f), `${f} still truncates at every width`).toContain("line-clamp-2");
    }
  });
});

describe("adding lessons to the calendar offers the step the owner takes", () => {
  it("offers the next two, not the next four", () => {
    const src = read("src/components/admin/CohortSessionsAdmin.tsx");
    expect(src).toContain("Adaugă următoarele 2 lecții");
    expect(src).toContain("r.plan.slice(0, 2)");
    expect(src, "the four-lesson batch is gone").not.toContain("Adaugă următoarele 4 lecții");
  });

  it("still offers one lesson and all remaining", () => {
    const src = read("src/components/admin/CohortSessionsAdmin.tsx");
    expect(src).toContain("Adaugă următoarea lecție");
    expect(src).toContain("Adaugă toate cele");
  });
});
