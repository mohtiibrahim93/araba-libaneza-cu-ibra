import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Filling in a form is not paying for the course.
 *
 * `notify-registration` runs the moment a registration row is written, which
 * is before any payment exists. Its email is a receipt for a *request*, and
 * its words have always said so — "am primit cererea ta", and step 2 of the
 * next-steps list reads "plata este cea care îți confirmă locul în grupă".
 *
 * It was also attaching the Zoom link, under a heading telling the reader to
 * save it because they would use it for every online lesson, plus an .ics
 * calendar invite for a course they had not bought. One static Zoom room
 * serves every online lesson, so that link is not a detail about the class —
 * it is the class. Anyone who typed a name and an email got the key to it,
 * and a calendar entry saying they were in.
 *
 * The leak was in all three paths, not only the group one: the private
 * confirmation sent the same room to any online registrant, and the kids
 * confirmation sent the calendar invite.
 *
 * Paid registrants lose nothing. There is no post-payment email in this
 * codebase at all — the joining details travel in the welcome message within
 * 24 hours of payment that step 3 of the same email promises, which is sent
 * by hand. Gating here does not take anything away from someone who paid; it
 * stops giving it to everyone who did not.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("an unpaid registration gets no way into the class", () => {
  const fn = read("supabase/functions/notify-registration/index.ts");

  it("reads whether the registration was actually paid", () => {
    expect(fn).toContain("payment_status");
    expect(fn).toContain('const paid = reg.payment_status === "paid"');
  });

  it("withholds the Zoom room until it has been paid for", () => {
    // Group and private both send the same static room.
    expect(fn).toContain("zoomLink: paid ? zoomLink || undefined : undefined");
    expect(fn).toContain('zoomLink: paid && reg.format === "online"');
    // No ungated zoomLink anywhere.
    for (const line of fn.split("\n")) {
      if (!line.includes("zoomLink:")) continue;
      expect(line, `ungated zoom link: ${line.trim()}`).toContain("paid");
    }
  });

  it("withholds the calendar invite too", () => {
    // An .ics for a course nobody bought reads as a confirmed booking, and the
    // link is HMAC-signed so it keeps working.
    for (const line of fn.split("\n")) {
      if (!line.includes("icsUrl:")) continue;
      expect(line, `ungated calendar invite: ${line.trim()}`).toContain("paid");
    }
    expect(fn).toContain("icsUrl: paid && hasSchedule ? icsUrl : undefined");
  });

  it("still tells them what they asked about", () => {
    // The schedule, level, format and start date stay: they are public on the
    // site, and someone deciding whether to pay needs them. Withholding those
    // would punish the reader rather than protect the class.
    expect(fn).toContain("scheduleLabel: scheduleLabel || undefined");
    expect(fn).toContain("startDateLabel");
    expect(fn).toContain("level: reg.level || undefined");
  });

  it("keeps the email honest about what has happened", () => {
    const tpl = read(
      "supabase/functions/_shared/transactional-email-templates/group-registration-confirmation.tsx",
    );
    // It is a receipt for a request, not a confirmation of a place.
    expect(tpl).toContain("Am primit cererea ta pentru cursul de grup");
    expect(tpl).toContain("Plata este cea care îți confirmă locul în grupă");
    // The Zoom block is still conditional on being given a link at all.
    expect(tpl).toContain("{zoomLink && (");
    expect(tpl).toContain("{icsUrl && (");
  });
});
