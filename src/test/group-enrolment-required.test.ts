import { describe, expect, it } from "vitest";
import { loadEdgeModule } from "./helpers/edge-handler";
const helper = () => loadEdgeModule("supabase/functions/_shared/group-enrolment.ts", {});
const cohort = { id: "g", form_type: "group", level: "A1", format: "online", status: "forming", is_active: true };
const registration = { form_type: "group", cohort_id: "g", level: "A1", format: "online" };
const db = (row: unknown = cohort) => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: null }) }) }) }) });
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
