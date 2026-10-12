import type { Registration } from "@/components/admin/types";

export const courseFilterKeys = ["format", "age", "level", "teachingLanguage", "status", "payment"] as const;
export type CourseFilterKey = typeof courseFilterKeys[number];
export type CourseFilters = Record<CourseFilterKey, string>;
export const emptyCourseFilters = (): CourseFilters => ({ format: "all", age: "all", level: "all", teachingLanguage: "all", status: "all", payment: "all" });
const known = (value: string | null | undefined) => value || "unspecified";
export function describeRegistrationCourse(r: Partial<Pick<Registration, "cohort" | "format" | "age_category" | "level" | "teaching_language" | "refunded_at" | "payment_status">>): CourseFilters {
  const c = r.cohort;
  const format = c ? c.format : r.format;
  return {
    format: format === "physical" ? "fizic" : known(format),
    age: known(c ? c.age_category : r.age_category),
    level: known(c ? c.level : r.level),
    teachingLanguage: known(c ? c.teaching_language : r.teaching_language),
    status: known(c?.status),
    payment: r.refunded_at ? "refunded" : known(r.payment_status),
  };
}
export function matchesCourseFilters(row: CourseFilters, filters: CourseFilters) {
  return courseFilterKeys.every((key) => filters[key] === "all" || filters[key] === row[key]);
}
export function courseFilterOptions(rows: CourseFilters[]): Record<CourseFilterKey, string[]> {
  return Object.fromEntries(courseFilterKeys.map((key) => [key, [...new Set(rows.map((r) => r[key]))].sort()])) as Record<CourseFilterKey, string[]>;
}
