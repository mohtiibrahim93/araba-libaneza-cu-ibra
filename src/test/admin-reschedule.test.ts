import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Moving a student's lesson from the panel.
 *
 * The panel could cancel a booking and nothing else. Changing a time meant
 * cancelling and asking the student to book again, or editing Google Calendar
 * by hand — and that second one is the direction that does not come back into
 * the panel, so the admin's own calendar view went stale from the owner doing
 * the only thing left to him.
 *
 * Two things matter here and they pull against each other. The owner must not
 * be bound by his own published hours: "nine on Sunday, just this once" is a
 * normal arrangement, and a panel that refuses it is what sends him back to
 * editing Google by hand. But a student must stay bound by them, or the
 * availability rules mean nothing. So the exemption is earned by the
 * service-role key, and this file exists to catch it leaking.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const manage = read("supabase/functions/booking-manage/index.ts");
const admin = read("supabase/functions/admin-registrations/index.ts");
const ui = read("src/components/BookingsAdmin.tsx");

describe("the availability exemption", () => {
  it("is earned by the service-role key, not assumed", () => {
    expect(manage).toContain("const admin = internalCall(req);");
    // internalCall compares the bearer against the service-role key.
    expect(manage).toContain("serviceRoleKey.length > 0 && bearer === serviceRoleKey");
  });

  it("still binds a student to the offered slots", () => {
    // The gate is unchanged for anyone without the key; only `!admin &&` was
    // added in front of it.
    expect(manage).toContain("if (!admin && outsideAvailability) {");
    expect(manage).toContain('code: "invalid_slot"');
  });

  it("refuses the owner once, with reasons, before it will override", () => {
    // Not a button that silently double-books him: the first call reports.
    expect(manage).toContain("if (found.length > 0 && (!admin || body.force !== true)) {");
    expect(manage).toContain('code: "outside_availability"');
    expect(manage).toContain("clashes: found");
  });

  it("names what clashes instead of just saying the slot is taken", () => {
    for (const cause of ["another_booking", "calendar", "group_lesson"]) {
      expect(manage, `${cause} must be reported by name`).toContain(`found.push("${cause}")`);
    }
  });

  it("keeps a student's refusal identical to what it was", () => {
    // A student gets the same 409 + code: "conflict" as before; the clash
    // detail rides along but the outcome does not change.
    const guard = manage.slice(manage.indexOf("if (found.length > 0"));
    expect(guard.slice(0, 260)).toContain('code: "conflict"');
    expect(guard.slice(0, 260)).toContain("409");
  });
});

describe("the admin action", () => {
  it("goes through booking-manage rather than reimplementing any of it", () => {
    // One code path patches the calendar event in place (keeping its Meet
    // link), writes the new row with original_booking_id, and sends both
    // emails. A second implementation here would drift from it.
    const block = admin.slice(admin.indexOf('action === "reschedule_booking"'));
    expect(block.slice(0, 2600)).toContain("/functions/v1/booking-manage/");
    expect(block.slice(0, 2600)).toContain('method: "PATCH"');
    expect(block.slice(0, 2600)).toContain("SUPABASE_SERVICE_ROLE_KEY");
    // And it must not talk to Google or send email itself.
    expect(block.slice(0, 2600)).not.toContain("GCAL_GATEWAY");
    expect(block.slice(0, 2600)).not.toContain("sendBookingEmail");
  });

  it("rejects a time it cannot parse", () => {
    const block = admin.slice(admin.indexOf('action === "reschedule_booking"'));
    expect(block.slice(0, 1200)).toContain("Number.isFinite(Date.parse(newStart))");
  });

  it("refuses to move a booking that is not active", () => {
    const block = admin.slice(admin.indexOf('action === "reschedule_booking"'));
    expect(block.slice(0, 1600)).toContain('booking.status !== "confirmed"');
  });

  it("writes the move to the audit trail, forced or not", () => {
    const block = admin.slice(admin.indexOf('action === "reschedule_booking"'));
    expect(block.slice(0, 2600)).toContain('action: "reschedule_booking"');
    expect(block.slice(0, 2600)).toContain("forced: force");
    // And the Jurnal screen can name it.
    expect(read("src/components/admin/AuditLogAdmin.tsx")).toContain('reschedule_booking: "Mutare lecție"');
  });

  it("passes the structured codes back to the panel", () => {
    // Otherwise the warning degrades to "Mutare eșuată" and the owner has no
    // idea what he is being stopped by.
    const block = admin.slice(admin.indexOf('action === "reschedule_booking"'));
    expect(block.slice(0, 2600)).toContain("code: out?.code");
    expect(block.slice(0, 2600)).toContain("clashes: out?.clashes ?? []");
  });
});

describe("the panel", () => {
  it("offers the move beside the cancel it already had", () => {
    expect(ui).toContain('action: "reschedule_booking"');
    expect(ui).toContain("openMove(b)");
    expect(ui).toContain("Mută lecția");
  });

  it("converts Bucharest civil time with the shared DST-aware helper", () => {
    // An hour out here books a real student at the wrong time. Twice a year a
    // hand-rolled offset would be wrong.
    expect(ui).toContain("bucharestCivilToUtc(y, m, d, hh, mm)");
    expect(ui).not.toMatch(/getTimezoneOffset|[+-]\s*2\s*\*\s*3600/);
  });

  it("uses the 24-hour control rather than a native time input", () => {
    expect(ui).toContain("<TimeField");
    expect(ui).not.toContain('type="time"');
  });

  it("asks a second time before overriding", () => {
    // force is sent only once a warning is showing, and the button says so.
    expect(ui).toContain("void submitMove(moveWarn !== null)");
    expect(ui).toContain('moveWarn ? "Mută oricum" : "Mută lecția"');
  });

  it("tells the owner what he is overriding, in words", () => {
    for (const label of ["altă programare", "ceva din Google Calendar", "o lecție de grup"]) {
      expect(ui, `${label} must be spelled out`).toContain(label);
    }
    expect(ui).toContain("în afara orelor tale din Disponibilitate");
  });
});

/**
 * Booking a private lesson for someone by hand.
 *
 * A group signup could be added from the panel. A private lesson has a time,
 * so it could not be added at all — the owner agrees an hour on WhatsApp and
 * has nowhere to record it, which is how a lesson ends up in Google Calendar
 * and nowhere else, and the panel never learns about it.
 */
describe("booking a private lesson from the panel", () => {
  const block = admin.slice(admin.indexOf('action === "book_for_student"'));
  const head = block.slice(0, 5200);

  it("books through booking-create rather than writing a booking row", () => {
    // That one path creates the calendar event with its link, emails the
    // student their confirmation and manage link, and promotes the lead.
    expect(head).toContain("/functions/v1/booking-create");
    expect(head).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(head).not.toMatch(/from\("bookings"\)\s*\.insert/);
  });

  it("books the private lesson type, by its real slug", () => {
    // "paid" is the 60-minute private lesson in booking_event_types; the
    // group courses are not bookings at all.
    expect(head).toContain('event_type: "paid"');
  });

  it("records unpaid rather than pending when it is not paid for", () => {
    // AGENTS.md: unpaid means no payment was attempted, which is exactly a
    // lesson agreed by hand. pending would claim money is in flight.
    expect(head).toContain('payment_status: paid ? "paid" : "unpaid"');
    expect(head).not.toContain('"pending"');
  });

  it("does not leave a registration behind when the booking fails", () => {
    // It is written first, so a refused slot would otherwise leave a lesson
    // in Înscrieri that never happened.
    expect(head).toContain('from("registrations").delete().eq("id", registrationId)');
  });

  it("validates the name, the email and the time before writing anything", () => {
    expect(head).toContain("Numele este obligatoriu");
    expect(head).toContain("Emailul nu este valid");
    expect(head).toContain("Number.isFinite(Date.parse(startAt))");
  });

  it("writes it to the audit trail", () => {
    expect(head).toContain('action: "book_for_student"');
    expect(read("src/components/admin/AuditLogAdmin.tsx")).toContain(
      'book_for_student: "Programare manuală"',
    );
  });
});

describe("the notice period and the panel", () => {
  const create = read("supabase/functions/booking-create/index.ts");

  it("does not apply the owner's own notice period to the owner", () => {
    // "I am with him now, put the lesson in for this afternoon" is the normal
    // reason to book from the panel; a 12-hour notice would refuse it.
    expect(create).toContain("if (!internalCall && startMs < now + (et.min_notice_hours ?? 0)");
  });

  it("still refuses a time in the past, for everyone", () => {
    expect(create).toContain('code: "past"');
    const past = create.slice(create.indexOf('code: "past"') - 200, create.indexOf('code: "past"'));
    expect(past).not.toContain("internalCall");
  });

  it("keeps a visitor's clash refusal unchanged", () => {
    expect(create).toContain("if (found.length > 0 && (!internalCall || body.force !== true))");
    expect(create).toContain('code: "conflict"');
  });
});

describe("the booking form", () => {
  it("collects what a lesson needs and nothing it does not", () => {
    expect(ui).toContain('action: "book_for_student"');
    expect(ui).toContain("Programează o lecție privată");
    expect(ui).toContain("A plătit deja");
  });

  it("says that only the first lesson of a package is booked", () => {
    // Otherwise "câte lecții a luat: 10" reads as booking ten slots now.
    expect(ui).toContain("Se programează doar prima");
  });

  it("converts the time with the DST-aware helper, like the move dialog", () => {
    const form = ui.slice(ui.indexOf("const submitBooking"));
    expect(form.slice(0, 900)).toContain("bucharestCivilToUtc(y, m, d, hh, mm)");
  });
});
