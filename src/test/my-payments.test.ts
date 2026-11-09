import { describe, it, expect } from "vitest";
import { monthsText, paymentStatusText, totalPaidLei } from "@/lib/myPayments";

describe("student payments on Rezervările mele", () => {
  it("keeps free distinct from unpaid", () => {
    expect(paymentStatusText("free", "ro")).toBe("Gratuit");
    expect(paymentStatusText("unpaid", "ro")).toBe("Neplătit");
  });
  it("sums recorded payments in lei", () => {
    expect(
      totalPaidLei({
        payments: [
          { amount_lei: 500, paid_at: "", kind: "", method: "" },
          { amount_lei: 250, paid_at: "", kind: "", method: "" },
        ],
      }),
    ).toBe(750);
  });
  it("shows months paid only for multi-month courses", () => {
    expect(monthsText({ months_total: 4, months_paid: 2 }, "ro")).toBe(
      "2 din 4 luni plătite",
    );
    expect(monthsText({ months_total: 1, months_paid: 1 }, "ro")).toBeNull();
  });
});
