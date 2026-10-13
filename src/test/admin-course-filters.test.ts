import { describe, expect, it } from "vitest";
import {
  describeRegistrationCourse,
  matchesCourseFilters,
  emptyCourseFilters,
  courseFilterOptions,
} from "@/lib/adminCourseFilters";
import type { Registration } from "@/components/admin/types";
const row = {
  form_type: "group",
  format: "online",
  level: "A1",
  language: "ro",
  cohort: {
    id: "selected",
    level: "A2",
    format: "fizic",
    age_category: "adolescenti",
    teaching_language: "en",
    status: "in_progress",
  },
} as Registration;
describe("configured course filters", () => {
  it("uses the selected group, including teaching language rather than browser language", () => {
    const descriptor = describeRegistrationCourse(row);
    expect(descriptor).toMatchObject({
      format: "fizic",
      level: "A2",
      age: "adolescenti",
      teachingLanguage: "en",
      status: "in_progress",
    });
    expect(
      matchesCourseFilters(descriptor, {
        ...emptyCourseFilters(),
        teachingLanguage: "ro",
      }),
    ).toBe(false);
    expect(
      matchesCourseFilters(descriptor, {
        ...emptyCourseFilters(),
        teachingLanguage: "en",
        level: "A2",
      }),
    ).toBe(true);
  });
  it("keeps unassigned groups unknown rather than using another matching course", () => {
    const descriptor = describeRegistrationCourse({
      form_type: "group",
      level: "A1",
      language: "ro",
    } as Registration);
    expect(descriptor.teachingLanguage).toBe("unspecified");
    expect(descriptor.status).toBe("unspecified");
    expect(
      matchesCourseFilters(descriptor, {
        ...emptyCourseFilters(),
        status: "in_progress",
      }),
    ).toBe(false);
  });
  it("offers only available configured levels and age categories", () => {
    const options = courseFilterOptions([describeRegistrationCourse(row)]);
    expect(options.level).toEqual(["A2"]);
    expect(options.age).toEqual(["adolescenti"]);
  });
  it("normalizes booking-style physical format without combining payment states", () => {
    const descriptor = describeRegistrationCourse({
      format: "physical",
      payment_status: "pending",
    } as Registration);
    expect(descriptor.format).toBe("fizic");
    expect(descriptor.payment).toBe("pending");
    expect(
      matchesCourseFilters(descriptor, {
        ...emptyCourseFilters(),
        payment: "unpaid",
      }),
    ).toBe(false);
  });
  it("keeps missing fields of a selected group unspecified rather than using old registration details", () => {
    const descriptor = describeRegistrationCourse({
      ...row,
      format: "online",
      level: "A1",
      teaching_language: "ro",
      age_category: "adulti",
      cohort: {
        ...row.cohort!,
        format: null,
        level: null,
        teaching_language: null,
        age_category: null,
      },
    });
    expect(descriptor).toMatchObject({
      format: "unspecified",
      level: "unspecified",
      teachingLanguage: "unspecified",
      age: "unspecified",
    });
  });
});
