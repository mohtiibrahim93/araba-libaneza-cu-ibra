import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { partialRefundNote } from "@/components/admin/types";

/**
 * Owner's decision (13 October 2026): a partial refund keeps the status the
 * money had (usually "Plătit") and shows the amount next to it; only a full
 * refund reads "Rambursat".
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("partial refund note", () => {
  it("shows the refunded amount in lei for a paid registration", () => {
    expect(
      partialRefundNote({ payment_status: "paid", refunded_amount: 20000 }),
    ).toMatch(/^rambursat parțial: 200 lei$/);
  });
  it("is absent when nothing was refunded or the refund was full", () => {
    expect(
      partialRefundNote({ payment_status: "paid", refunded_amount: 0 }),
    ).toBeNull();
    expect(
      partialRefundNote({ payment_status: "paid", refunded_amount: null }),
    ).toBeNull();
    expect(
      partialRefundNote({ payment_status: "refunded", refunded_amount: 50000 }),
    ).toBeNull();
  });
  it("is used by the list, the private lessons table and the person sheet; refunded_at alone no longer reads Rambursat", () => {
    for (const file of [
      "RegistrationsTable",
      "PrivateLessonsAdmin",
      "PersonSheet",
    ]) {
      expect(read(`src/components/admin/${file}.tsx`)).toContain(
        "partialRefundNote(",
      );
    }
    expect(read("src/components/admin/RegistrationsTable.tsx")).not.toContain(
      'r.refunded_at || r.payment_status === "refunded"',
    );
    expect(read("src/components/admin/PrivateLessonsAdmin.tsx")).not.toContain(
      'r.refunded_at ? "Rambursat"',
    );
  });
});
