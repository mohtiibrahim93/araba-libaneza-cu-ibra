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
  /** Phone number has the Romanian +40 prefix. Cash at the centre is offered
   *  only then; card, transfer and PayPal are offered to everyone (owner,
   *  5 Nov 2026). */
  inRomania?: boolean | undefined;
}
