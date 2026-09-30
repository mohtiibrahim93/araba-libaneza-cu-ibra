import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Cancelling and rescheduling stop 24 hours before the lesson.
 *
 * The rule is stated in four places already — the scheduler notice, the FAQ,
 * the trial rules list and the confirmation emails — and until now it was only
 * ever stated. `booking-manage` accepted a DELETE or a PATCH at any time,
 * including for a lesson starting in ten minutes, which is exactly the case
 * the 150-lei no-show charge exists to cover. A slot given up that late cannot
 * be filled.
 *
 * Enforcement has to be in the function, not only in the page: the manage link
 * carries a token, and anyone holding the email can call the endpoint directly.
 *
 * A real emergency is not refused — it is just not self-service. The blocked
 * screen has to name the rule and point at WhatsApp, so someone with a genuine
 * problem reaches a person instead of a dead end. Without that path the rule
 * produces silent no-shows; without the rule, "emergency" costs nothing to
 * claim.
 *
 * These are source assertions: the function runs on Deno against live Google
 * and Stripe, so there is nothing here to execute, but each piece can be
 * removed by accident and the failure is silent in both directions.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("changes close 24 hours before the lesson", () => {
  const manage = read("supabase/functions/booking-manage/index.ts");
  const page = read("src/pages/BookingManage.tsx");

  it("enforces the cutoff in the function, for both cancel and reschedule", () => {
    expect(manage).toContain("CHANGE_CUTOFF_MS = 24 * 60 * 60 * 1000");
    expect(manage).toContain('code: "too_late"');
    // One gate above both branches, rather than a copy in each that can drift.
    const gate = manage.indexOf("tooLateToChange(booking.start_at)) {");
    const del = manage.indexOf('if (req.method === "DELETE")');
    const patch = manage.indexOf('if (req.method === "PATCH")');
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(del);
    expect(gate).toBeLessThan(patch);
  });

  it("leaves the GET readable, so the link never dead-ends on a 409", () => {
    // GET returns before the gate: someone arriving late still sees their
    // booking and the explanation, they just cannot change it.
    const get = manage.indexOf('if (req.method === "GET")');
    const gate = manage.indexOf("tooLateToChange(booking.start_at)) {");
    expect(get).toBeLessThan(gate);
    expect(manage).toContain("changes_allowed");
  });

  it("hides the two buttons and says why, with a way to reach a person", () => {
    expect(page).toContain("tooLate");
    expect(page).toContain("t.manageTooLateTitle");
    expect(page).toContain("t.manageTooLateEmergency");
    expect(page).toContain("WHATSAPP_CONTACT_URL");
  });

  it("handles the cutoff passing while the page is open", () => {
    // The page can have been left open across the boundary; the function
    // answers 409 and the toast has to explain that rather than "try again".
    expect(page).toContain('json?.code === "too_late"');
    expect(page).toContain("t.manageTooLateToast");
  });

  it("explains a slot the reschedule check rejects", () => {
    // booking-manage validates the new time against the availability rules and
    // answers 400 invalid_slot; without this the page showed "try again" for a
    // time that will never be accepted.
    expect(page).toContain('json?.code === "invalid_slot"');
    expect(page).toContain("t.manageSlotNotBookable");
  });

  it("writes the blocked screen in both languages", () => {
    const i18n = read("src/lib/i18n.tsx");
    for (const key of [
      "manageTooLateTitle",
      "manageTooLateBody",
      "manageTooLateEmergency",
      "manageWhatsAppCta",
      "manageTooLateToast",
      "manageSlotNotBookable",
    ]) {
      expect(
        i18n.split(`${key}:`).length - 1,
        `${key} is not in both dictionaries`,
      ).toBe(2);
    }
  });

  it("reads the page in the language the booking was made in", () => {
    // The link arrives in a confirmation email that was itself sent in the
    // booking's language; the page used to follow whatever the browser had in
    // localStorage, so an English booker got a Romanian page.
    expect(manage).toContain('language: booking.language ?? "ro"');
    expect(page).toContain("booking?.language && booking.language !== lang");
  });

  it("does not lock Ibra out of his own calendar", () => {
    // The cutoff exists to protect his time from a late cancellation, so it
    // must not stop him cancelling one: the admin panel cancels through this
    // same endpoint with the service-role key, which is how he acts on the
    // emergency the blocked screen tells people to write in about.
    expect(manage).toContain("!internalCall(req) && tooLateToChange(booking.start_at)");
    // Earned by the key, not assumed — the manage token travels in email.
    expect(manage).toContain("bearer === serviceRoleKey");
    const admin = read("supabase/functions/admin-registrations/index.ts");
    expect(admin).toContain("/functions/v1/booking-manage/");
    expect(admin).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("applies the same cutoff on the bookings list", () => {
    // /rezervarile-mele lists every booking with its own cancel button and
    // calls the same endpoint, so offering it inside the window would just
    // produce a 409 and a "try again" toast.
    const mine = read("src/pages/MyBookings.tsx");
    expect(mine).toContain("function tooLateToChange");
    expect(mine).toContain("active && !tooLateToChange(booking.start_at)");
    expect(mine).toContain("active && tooLateToChange(booking.start_at)");
    expect(mine).toContain("WHATSAPP_CONTACT_URL");
    expect(mine).toContain('body?.code === "too_late"');
    // Both languages, as everywhere else on the site.
    for (const key of ["tooLateTitle", "tooLateBody", "tooLateEmergency", "whatsapp", "tooLateToast"]) {
      expect(mine.split(`${key}:`).length - 1, `${key} is not in both COPY blocks`).toBe(2);
    }
  });

  it("lists each day's slots in time order", () => {
    // Candidates come out in the order the availability rules are stored, so
    // Friday listed 09:30 after 17:00. Sorting the flat list before grouping
    // fixes both `slots` and `slots_by_date`.
    const availability = read("supabase/functions/booking-availability/index.ts");
    const sort = availability.indexOf("filtered.sort();");
    const group = availability.indexOf("const byDate = new Map");
    expect(sort).toBeGreaterThan(-1);
    expect(sort).toBeLessThan(group);
  });
});
