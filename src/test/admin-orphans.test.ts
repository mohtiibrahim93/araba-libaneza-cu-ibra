import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The two features that had a working backend and no way in.
 *
 * `list_kids_slots` / `upsert_kids_slot` / `delete_kids_slot` and
 * `list_audit_logs` were implemented and deployed with nothing in `src/`
 * calling them. The kids' slots could only be changed in the database by hand,
 * and the audit log — which records every deletion, GDPR anonymisation, refund
 * and subscription cancellation — was being written where nobody could read
 * it, which is most of the way to not keeping one.
 *
 * Two things here are worth more than the rest:
 *
 * The weekday offset. `kids_class_slots.weekday` is 1 = Monday to 7 = Sunday,
 * documented in `useKidsSlots.ts` and relied on by the public KidsSlotPicker.
 * `availability_rules.weekday` is 0 = Sunday, matching JavaScript's getDay().
 * Two tables, two conventions, identical column name. Getting it wrong here
 * moves every kids' class one day and nothing would throw.
 *
 * And that the audit log stays read-only. A trail the audited party can edit
 * is not a trail.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("the two orphaned features now have screens", () => {
  const kids = read("src/components/admin/KidsSlotsAdmin.tsx");
  const audit = read("src/components/admin/AuditLogAdmin.tsx");
  const admin = read("src/pages/Admin.tsx");
  const hook = read("src/hooks/useKidsSlots.ts");

  it("calls the actions that had no caller", () => {
    expect(kids).toContain('action: "list_kids_slots"');
    expect(kids).toContain('action: "upsert_kids_slot"');
    expect(kids).toContain('action: "delete_kids_slot"');
    expect(audit).toContain('action: "list_audit_logs"');
  });

  it("is reachable from the nav", () => {
    for (const v of ["kids-slots", "audit-log"]) {
      expect(admin, `${v} has no nav item`).toContain(`value: "${v}"`);
      expect(admin, `${v} has no screen`).toContain(`<TabsContent value="${v}"`);
    }
    expect(admin).toContain("<KidsSlotsAdmin />");
    expect(admin).toContain("<AuditLogAdmin />");
  });

  it("reads Monday as 1, the way the table and the public picker do", () => {
    // The source of truth for the convention.
    expect(hook).toContain("1=Mon..7=Sun");
    // Monday first in the label list, and indexed with the offset.
    expect(kids).toMatch(/WEEKDAYS = \["Luni",/);
    expect(kids).toContain("WEEKDAYS[s.weekday - 1]");
    // The <option> values run 1..7, not 0..6.
    expect(kids).toContain("value={i + 1}");
  });

  it("does not borrow the other table's 0 = Sunday convention", () => {
    // availability_rules uses ["Dum", "Lun", ...]. If that list ever appears
    // here, every kids' class has silently moved a day.
    expect(kids).not.toContain('"Dum"');
    expect(kids).not.toContain("weekday]");
  });

  it("asks before deleting a slot the public form is reading", () => {
    expect(kids).toContain("AlertDialog");
    expect(kids).toContain("Ștergi intervalul");
    // And says what survives the delete, which is the part people get wrong.
    expect(kids).toContain("Înscrierile deja făcute pe acest interval");
  });

  it("surfaces the server's own validation message", () => {
    // upsert_kids_slot answers "Zi invalidă (1-7)", "Oră invalidă",
    // "Format invalid", "Locuri/durată invalide" — all more useful than a
    // generic failure toast.
    expect(kids).toContain("data?.error) throw new Error(data.error)");
  });

  it("keeps the audit log read-only", () => {
    for (const w of ["upsert_audit", "delete_audit", "update_audit"]) {
      expect(audit, `the audit log must not be editable (${w})`).not.toContain(w);
    }
    expect(audit).toContain("Doar de citit");
  });

  it("marks the actions that destroy data", () => {
    expect(audit).toContain("DESTRUCTIVE");
    for (const a of ["delete", "force_delete", "anonymize"]) {
      expect(audit).toContain(`"${a}"`);
    }
    // force_delete is the newest and the most dangerous: it removes rows that
    // carry payment traces, which plain delete refuses to touch.
    expect(audit).toContain("Ștergere forțată");
  });

  it("gives the last unused action a home, and the hidden editor a door", () => {
    // list_card_overrides was the last admin action with no caller — redundant
    // rather than orphaned, since useCardOverrides.ts reads the table directly.
    // The screen it now feeds also fixes the other half: the game's own editor
    // lives at /joc and nothing in the panel said so.
    const cards = read("src/components/admin/CardOverridesAdmin.tsx");
    expect(cards).toContain('action: "list_card_overrides"');
    expect(cards).toContain('href="/joc"');
    expect(admin).toContain('value: "card-overrides"');
    expect(admin).toContain("<CardOverridesAdmin />");
    // Editing stays in the game, where the card is visible: this screen must
    // not grow a save of its own. Comments are stripped first — the file's own
    // doc comment explains where saving lives and names the action.
    const code = cards
      .split("\n")
      .filter((l) => {
        const t = l.trim();
        return !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
      })
      .join("\n");
    expect(code).not.toContain("save_card_overrides");
  });

  it("leaves no admin action without a screen", () => {
    const fn = read("supabase/functions/admin-registrations/index.ts");
    const actions = [...fn.matchAll(/action === "([a-z_]+)"/g)].map((m) => m[1]);
    expect(actions.length).toBeGreaterThan(40);
    const ui = [
      "src/pages/Admin.tsx",
      "src/components/YallaGame.tsx",
      ...["KidsSlotsAdmin", "AuditLogAdmin", "CardOverridesAdmin", "TodayAdmin", "AnalyticsAdmin"].map(
        (c) => `src/components/admin/${c}.tsx`,
      ),
    ]
      .map(read)
      .join("\n");
    // Most actions are called from the many other admin components; this only
    // pins the ones this session gave a home to, so the list cannot regress.
    for (const a of [
      "list_kids_slots",
      "upsert_kids_slot",
      "delete_kids_slot",
      "list_audit_logs",
      "list_card_overrides",
      "list_today",
      "list_analytics",
    ]) {
      expect(ui, `${a} has lost its caller again`).toContain(a);
    }
  });

  it("does not link a registration that may no longer exist", () => {
    // Half these entries are deletions, so the row they name is gone.
    expect(audit).toContain("registration_id.slice(0, 8)");
    expect(audit).not.toContain("admin/private-leads/${r.registration_id}");
  });
});
