export type CourseType = "group" | "private" | "kids";
export type FormatType = "fizic" | "online";
export type LevelType = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface SubmittedData {
  courseType: CourseType;
  email: string;
  name: string;
  registrationId: string;
  quantity?: number | undefined;
  groupPlan?: "monthly" | "full" | undefined;
  waitlistDeposit?: boolean | undefined;
  cohortId?: string | null | undefined;
  kidsSlotId?: string | null | undefined;
  /** Cash at the centre, bank transfer and PayPal are offered for in-person
   *  courses only; online courses are paid by card (owner, 5 Nov 2026). */
  format?: FormatType | undefined;
}
