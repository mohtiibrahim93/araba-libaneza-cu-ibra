export type CourseType = "group" | "private" | "kids";
export type FormatType = "fizic" | "online";
export type LevelType = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface SubmittedData {
  courseType: CourseType;
  email: string;
  name: string;
  registrationId: string;
  quantity?: number;
  waitlistDeposit?: boolean;
}