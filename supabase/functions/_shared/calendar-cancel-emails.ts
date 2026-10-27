// A lesson deleted in the owner's Google Calendar (owner's rule, 27 October
// 2026): the calendar sync cancels it here, and this tells the student, in
// their language, that the lesson was cancelled, and tells the owner. Nothing
// is refunded automatically; the owner decides in the admin.

import {
  fmtBookingLocal,
  sendAdminBookingEmail,
  sendBookingEmail,
} from "./booking-emails.ts";
import type { CancelledInGoogle } from "./calendar-reconciliation.ts";

export async function notifyGoogleCancellations(
  lessons: CancelledInGoogle[],
): Promise<void> {
  for (const lesson of lessons) {
    const lang = lesson.language === "en" ? "en" : "ro";
    if (lesson.student_email) {
      await sendBookingEmail(
        "booking-cancelled",
        lesson.student_email,
        {
          name: lesson.student_name ?? undefined,
          whenLabel: fmtBookingLocal(lesson.start_at, lang),
          lang,
          byTeacher: true,
        },
        // The same key as a cancellation from the panel would never collide:
        // this one names its cause.
        `booking-cancel-google-${lesson.id}`,
      );
    }
    sendAdminBookingEmail(
      "cancelled",
      {
        eventName:
          lesson.event_type_slug === "trial" ? "Lecție de probă" : "Lecție",
        studentName: lesson.student_name,
        studentEmail: lesson.student_email,
        studentPhone: lesson.student_phone,
        format: lesson.format === "online" ? "online" : "fizic",
        whenLabel: fmtBookingLocal(lesson.start_at, "ro"),
        notes:
          "Ștearsă din Google Calendar. Cursantul a primit emailul de anulare. Nu s-a făcut nicio rambursare automată — decizi tu în admin.",
      },
      `admin-booking-cancel-google-${lesson.id}`,
    );
  }
}
