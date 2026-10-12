import { describe, expect, it } from "vitest";
import { loadEdgeModule } from "./helpers/edge-handler";
const helper = () => loadEdgeModule("supabase/functions/_shared/group-enrolment.ts", {});
const cohort = { id: "g", form_type: "group", level: "A1", format: "online", status: "forming", is_active: true, max_seats: 6 };
const registration = { form_type: "group", cohort_id: "g", level: "A1", format: "online" };
const db = (row: unknown = cohort, taken = 0, countError: unknown = null) => ({
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: null }) }) }) }),
  rpc: async () => ({ data: countError ? null : [{ cohort_id: "g", taken }], error: countError }),
});
describe("exact group required before payment", () => {
  it("rejects a group registration without a group", async () => {
    const { groupEnrolmentError } = helper() as any;
    expect(await groupEnrolmentError(db(), { ...registration, cohort_id: null })).toBeTruthy();
  });
  it("rejects missing, mismatched and closed groups", async () => {
    const { groupEnrolmentError } = helper() as any;
    for (const row of [null, { ...cohort, is_active: false }, { ...cohort, level: "A2" }, { ...cohort, format: "fizic" }, { ...cohort, status: "completed" }]) {
      expect(await groupEnrolmentError(db(row), registration)).toBeTruthy();
    }
  });
  it("accepts an exact available group and leaves private/trial unchanged", async () => {
    const { groupEnrolmentError } = helper() as any;
    expect(await groupEnrolmentError(db(), registration)).toBeNull();
    expect(await groupEnrolmentError(db(), { form_type: "private" })).toBeNull();
    expect(await groupEnrolmentError(db(), { form_type: "trial" })).toBeNull();
  });
});

describe("group capacity before payment", () => {
  it("refuses to open payment for a full group", async () => {
    const { groupEnrolmentError } = helper() as any;
    expect(await groupEnrolmentError(db(cohort, 6), registration)).toBe("The selected group is full");
    expect(await groupEnrolmentError(db(cohort, 7), registration)).toBe("The selected group is full");
  });
  it("allows the last free seat", async () => {
    const { groupEnrolmentError } = helper() as any;
    expect(await groupEnrolmentError(db(cohort, 5), registration)).toBeNull();
  });
  it("lets a student who already holds a seat pay, even when the group is full", async () => {
    const { groupEnrolmentError } = helper() as any;
    for (const lead_status of ["qualified", "converted"]) {
      expect(await groupEnrolmentError(db(cohort, 6), { ...registration, lead_status })).toBeNull();
    }
  });
  it("fails closed when the seat count cannot be read", async () => {
    const { groupEnrolmentError } = helper() as any;
    expect(await groupEnrolmentError(db(cohort, 0, { message: "boom" }), registration)).toBeTruthy();
  });
});
