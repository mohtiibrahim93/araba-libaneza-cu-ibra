import { useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

/**
 * Creates the lead row at the moment of booking, from the details the
 * scheduler has just collected. Shared by /trial and the Programare page, so
 * both book the free trial the same way.
 *
 * /trial used to ask for name, email and phone on a screen of its own
 * before it would show any times — a visitor handed over their details
 * before knowing whether a single slot suited them, and then typed them
 * again in the scheduler's confirm form. The times come first now.
 *
 * Worth naming: the old order captured an email from people who never
 * reached a slot, and this one does not. That is the cost of the change —
 * the gain is that nobody is asked for anything until they have seen a time
 * they want.
 */
export function useTrialRegistration() {
  const { t, lang } = useI18n();
  // The registration this visit created, if any. Held in a ref so a retry
  // after a clashing slot reuses the row instead of writing a second one.
  const registrationIdRef = useRef<string | null>(null);

  return async (d: { name: string; email: string; phone: string }) => {
    if (registrationIdRef.current) return registrationIdRef.current;
    const id = crypto.randomUUID();
    const { error } = await supabase.from("registrations").insert({
      id,
      form_type: "trial",
      name: d.name,
      email: d.email,
      phone: d.phone,
      // The language the visitor is actually reading the site in. Without it a
      // trial lead arrived with language NULL, so there was no way to tell an
      // English enquiry from a Romanian one — which is also what decides which
      // cohorts they can be offered.
      language: lang,
      // Still "incomplete" at this point: booking-create promotes it to "new"
      // the moment the slot is actually taken, and that is what fires
      // trial_booking_complete. If the slot clashes and the booking fails, the
      // row correctly stays incomplete rather than counting as a conversion.
      lead_status: "incomplete",
    });
    if (error) {
      console.error("[trial] registration insert failed", error);
      toast.error(t.schedulerBookingFailed);
      return null;
    }
    registrationIdRef.current = id;
    return id;
  };
}
