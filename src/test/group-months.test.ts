import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  addMonths,
  groupMonths,
  monthsToCover,
  type MonthPaymentRow,
} from "../../supabase/functions/_shared/group-months";

// Group payments month by month (owner, 4 Nov 2026).
const row = (
  month_from: number,
  method: string,
  month_to = month_from,
): MonthPaymentRow => ({
  kind: method === "credit" ? "credit" : "month",
  method,
  amount_lei: method === "credit" ? 0 : 500,
  paid_at: "2026-11-03T12:00:00Z",
  month_from,
  month_to,
});

describe("one rule: Plătit la zi / Neplătit", () => {
  const start = "2026-11-07";

  it("month 1 is due from sign-up, month k from the start plus k−1 months", () => {
    const s = groupMonths({
      total: 4,
      startDate: start,
      rows: [],
      today: "2026-11-04",
    });
    expect(s.months.map((m) => m.due)).toEqual([true, false, false, false]);
    expect(s.months[1]!.dueFrom).toBe("2026-12-07");
    expect(s.status).toBe("unpaid");
  });

  it("Andrada: month 4 granted, months 1–3 hers to pay", () => {
    // Owner, 4 Nov 2026: the waived month is the last one; her transfer for
    // month 1 is recorded by the owner in the panel.
    const granted = [row(4, "credit")];
    const before = groupMonths({
      total: 4,
      startDate: start,
      rows: granted,
      today: "2026-11-04",
    });
    expect(before.months.map((m) => m.state)).toEqual([
      "unpaid",
      "unpaid",
      "unpaid",
      "granted",
    ]);
    expect(before.status).toBe("unpaid");
    const after = groupMonths({
      total: 4,
      startDate: start,
      rows: [...granted, row(1, "transfer")],
      today: "2026-11-04",
    });
    expect(after.status).toBe("up_to_date");
    // On 7 December month 2 falls due: Neplătit until it is recorded.
    expect(
      groupMonths({
        total: 4,
        startDate: start,
        rows: [...granted, row(1, "transfer")],
        today: "2026-12-07",
      }).status,
    ).toBe("unpaid");
    expect(
      readFileSync(
        "supabase/migrations/20261104120000_group_payment_months.sql",
        "utf8",
      ),
    ).toContain("set month_from = 4, month_to = 4");
  });

  it("Baciu: nothing recorded → Neplătit", () => {
    expect(
      groupMonths({ total: 4, startDate: start, rows: [], today: "2026-11-04" })
        .status,
    ).toBe("unpaid");
  });

  it("a paid first month does not hide an unpaid third", () => {
    const s = groupMonths({
      total: 4,
      startDate: "2026-08-01",
      rows: [row(1, "card_online"), row(2, "cash")],
      today: "2026-10-05",
    });
    expect(s.status).toBe("unpaid");
    expect(s.months[2]!.due).toBe(true);
  });

  it("states: online, outside the site, granted, unpaid", () => {
    const s = groupMonths({
      total: 4,
      startDate: start,
      rows: [row(1, "card_online"), row(2, "transfer"), row(3, "credit")],
    });
    expect(s.months.map((m) => m.state)).toEqual([
      "paid_online",
      "paid_offline",
      "granted",
      "unpaid",
    ]);
  });

  it("a payment covers only open months inside the course", () => {
    const s = groupMonths({
      total: 4,
      startDate: start,
      rows: [row(1, "credit")],
    });
    expect(monthsToCover(s, 1, 1)).toBeNull();
    expect(monthsToCover(s, 2, 3)).toEqual({ from: 2, to: 4 });
    expect(monthsToCover(s, 3, 3)).toBeNull();
  });

  it("adds calendar months, clamping the day", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-11-07", 2)).toBe("2027-01-07");
  });
});

describe("wired everywhere", () => {
  const read = (p: string) => readFileSync(p, "utf8");
  it("the panel offers the owner's methods and the grant", () => {
    const src = read("supabase/functions/_shared/group-months.ts");
    // A bank is not a method: Revolut is a transfer or a card (owner, 4 Nov).
    expect(src).not.toContain('"Revolut"');
    for (const label of [
      '"Transfer bancar"',
      '"Card (în afara site-ului)"',
      '"Cash"',
      '"Altă metodă"',
      '"Card online"',
      '"Lună acordată"',
    ])
      expect(src).toContain(label);
    expect(read("src/components/admin/GroupPayment.tsx")).toContain(
      "Lună acordată · fără plată",
    );
  });

  it("sheet, group cards and Acasă use the same rule", () => {
    const admin = read("supabase/functions/admin-registrations/index.ts");
    expect(admin).toContain("groupStudentsOwing(");
    expect(admin).toContain("month_status: months");
    expect(admin).toContain("r.payment_months = groupMonths(");
    expect(read("src/components/admin/PersonSheet.tsx")).toContain(
      "groupMonthStatusLabel(person)",
    );
  });

  it("Stripe records online months as Card online, once", () => {
    const hook = read("supabase/functions/stripe-webhook/index.ts");
    expect(hook).toContain("recordOnlineGroupMonths(");
    expect(read("supabase/functions/_shared/group-online-months.ts")).toContain(
      'method: "card_online"',
    );
    expect(
      read("supabase/migrations/20261104120000_group_payment_months.sql"),
    ).toContain("registration_payments_stripe_ref_key");
  });
});
