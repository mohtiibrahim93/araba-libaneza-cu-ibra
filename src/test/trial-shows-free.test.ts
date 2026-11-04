import { describe, expect, it } from "vitest";
import { displayPaymentStatus } from "@/components/admin/types";
import { describeRegistrationCourse } from "@/lib/adminCourseFilters";

describe("a free trial reads Gratuit in the admin", () => {
  it("shows an unpaid trial as free, in the label and the Plată filter", () => {
    const r = { form_type: "trial", payment_status: "unpaid" };
    expect(displayPaymentStatus(r)).toBe("free");
    expect(describeRegistrationCourse(r).payment).toBe("free");
  });
  it("keeps a trial with a saved card as card_saved", () => {
    expect(
      displayPaymentStatus({ form_type: "trial", payment_status: "card_saved" }),
    ).toBe("card_saved");
  });
  it("keeps an unpaid group course as unpaid", () => {
    expect(
      displayPaymentStatus({ form_type: "group", payment_status: "unpaid" }),
    ).toBe("unpaid");
  });
});

import { readFileSync } from "node:fs";
describe("a booked trial is saved as free", () => {
  it("booking-create moves a trial from unpaid to free, never over a saved card", () => {
    const src = readFileSync("supabase/functions/booking-create/index.ts", "utf8");
    expect(src).toMatch(/update\(\{ payment_status: "free" \}\)[\s\S]{0,120}\.eq\("form_type", "trial"\)\s*\.eq\("payment_status", "unpaid"\)/);
  });
});
