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
    expect(src).toContain("isAdmin ? <AdminChromeMarker /> : <AskAssistant />");
  });

  it("hides the reCAPTCHA badge where no form uses it", () => {
    // The script is declared in a static head() and cannot be dropped per
    // route, so the document is marked instead and one rule hides the badge.
    const src = read("src/routes/__root.tsx");
    expect(src).toContain("adminChrome");

    const css = read("src/styles.css");
    expect(css).toContain('html[data-admin-chrome="true"] .grecaptcha-badge');
  });

  it("clears the mark on the way out, so visitor pages keep their badge", () => {
    const src = read("src/routes/__root.tsx");
    expect(src).toContain('delete document.documentElement.dataset["adminChrome"]');
  });
});
