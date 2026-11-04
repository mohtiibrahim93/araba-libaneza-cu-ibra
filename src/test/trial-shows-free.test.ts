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
