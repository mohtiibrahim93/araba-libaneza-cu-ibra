import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeModule } from "./helpers/edge-handler";

/**
 * Joining a group that starts inside the 14-day withdrawal period (owner,
 * 17 Nov 2026: "protect me from free lessons"). The student may join it only
 * by asking, with a box they tick themselves, for the lessons to start in
 * that time; if they then withdraw, they pay for the lessons held. Every card
 * payment for a group sign-up is refused until that request is recorded.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const mod = () =>
  loadEdgeModule("supabase/functions/_shared/early-start.ts", {}) as {
    EARLY_START_DAYS: number;
    startsInsideWithdrawal: (start: string | null, today: string) => boolean;
    earlyStartGate: (
      db: unknown,
      reg: Record<string, unknown>,
      requested: unknown,
      today?: string,
    ) => Promise<null | { code: string; startDate: string; error: string }>;
  };

describe("which groups need the request", () => {
  it("a group starting on or before day 14, or already under way", () => {
    const { startsInsideWithdrawal, EARLY_START_DAYS } = mod();
    expect(EARLY_START_DAYS).toBe(14);
    const today = "2026-11-17";
    expect(startsInsideWithdrawal("2026-11-20", today)).toBe(true);
    expect(startsInsideWithdrawal("2026-12-01", today)).toBe(true); // day 14
    expect(startsInsideWithdrawal("2026-12-02", today)).toBe(false); // day 15
    expect(startsInsideWithdrawal("2027-01-09", today)).toBe(false);
    expect(startsInsideWithdrawal("2026-11-07", today)).toBe(true); // started
    expect(startsInsideWithdrawal(null, today)).toBe(false);
  });
});

type Row = Record<string, unknown>;
function fakeDb(tables: Record<string, Row[]>, failRead?: string) {
  const updates: Array<{ table: string; value: Row; filters: string[] }> = [];
  const from = (table: string) => {
    const tests: Array<(r: Row) => boolean> = [];
    const tags: string[] = [];
    let patch: Row | null = null;
    const run = async () => {
      if (failRead === table && !patch)
        return { data: null, error: { message: "down" } };
      const hit = (tables[table] ?? []).filter((r) => tests.every((t) => t(r)));
      if (patch) {
        for (const r of hit) Object.assign(r, patch);
        updates.push({ table, value: patch, filters: tags });
        return { data: null, error: null };
      }
      return { data: hit[0] ?? null, error: null };
    };
    const q: any = {
      select: () => q,
      update: (v: Row) => ((patch = v), q),
      eq: (k: string, v: unknown) => (
        tags.push(`${k}=${v}`),
        tests.push((r) => r[k] === v),
        q
      ),
      is: (k: string, v: unknown) => (
        tags.push(`${k} is ${v}`),
        tests.push((r) => (r[k] ?? null) === v),
        q
      ),
      maybeSingle: run,
      then: (ok: (v: unknown) => void) => run().then(ok),
    };
    return q;
  };
  return { db: { from }, updates, tables };
}
const TODAY = "2026-11-17";
const tables = (start: string, requestedAt: string | null = null) => ({
  group_cohorts: [{ id: "c1", start_date: start }],
  registrations: [{ id: "r1", early_start_requested_at: requestedAt }],
});
const REG = { id: "r1", form_type: "group", cohort_id: "c1" };

describe("the check every group card payment passes", () => {
  it("refuses the payment for a group starting within 14 days until the student asks", async () => {
    const { db, updates } = fakeDb(tables("2026-11-21"));
    const out = await mod().earlyStartGate(db, REG, undefined, TODAY);
    expect(out).toMatchObject({
      code: "early_start_required",
      startDate: "2026-11-21",
    });
    expect(updates).toEqual([]);
    // Anything but a real `true` is not a request.
    for (const requested of ["true", 1, {}, false])
      expect(
        await mod().earlyStartGate(db, REG, requested, TODAY),
      ).not.toBeNull();
  });

  it("records the request, once, when the student ticked the box", async () => {
    const t = tables("2026-11-21");
    const { db, updates } = fakeDb(t);
    expect(await mod().earlyStartGate(db, REG, true, TODAY)).toBeNull();
    expect(updates).toHaveLength(1);
    expect(updates[0]!.table).toBe("registrations");
    expect(updates[0]!.filters).toEqual([
      "id=r1",
      "early_start_requested_at is null",
    ]);
    expect(t.registrations[0]!.early_start_requested_at).toEqual(
      expect.any(String),
    );
    // Recorded: the next call goes through without asking again.
    expect(await mod().earlyStartGate(db, REG, undefined, TODAY)).toBeNull();
    expect(updates).toHaveLength(1);
  });

  it("lets everything else through untouched", async () => {
    const { db, updates } = fakeDb(tables("2027-01-09"));
    expect(await mod().earlyStartGate(db, REG, undefined, TODAY)).toBeNull();
    for (const reg of [
      { ...REG, form_type: "private" },
      { ...REG, form_type: "trial" },
      { ...REG, cohort_id: null },
    ])
      expect(await mod().earlyStartGate(db, reg, undefined, TODAY)).toBeNull();
    expect(updates).toEqual([]);
  });

  it("a request the owner already recorded (email or WhatsApp) is enough", async () => {
    const { db } = fakeDb(tables("2026-11-21", "2026-11-16T12:00:00.000Z"));
    expect(await mod().earlyStartGate(db, REG, undefined, TODAY)).toBeNull();
  });

  it("stops the payment when it cannot read the group or the sign-up", async () => {
    for (const table of ["group_cohorts", "registrations"]) {
      const { db } = fakeDb(tables("2026-11-21"), table);
      await expect(
        mod().earlyStartGate(db, REG, true, TODAY),
      ).rejects.toThrow();
    }
  });
});

describe("every way to pay a group by card asks for it", () => {
  for (const fn of [
    "create-payment-intent",
    "create-subscription",
    "create-checkout-session",
    "create-checkout",
  ]) {
    it(fn, () => {
      const src = read(`supabase/functions/${fn}/index.ts`);
      expect(src).toContain(
        'import { earlyStartGate } from "../_shared/early-start.ts";',
      );
      expect(src).toMatch(
        /earlyStart,?\s*\n?\s*\}\s*=\s*await req\.json\(\)|earlyStart \}\s*=\s*\n?\s*await req\.json\(\)/,
      );
      expect(src).toMatch(
        /const earlyStartRefusal = await earlyStartGate\(\s*\w+,\s*\w+,\s*earlyStart,?\s*\)/,
      );
      expect(src).toMatch(
        /if \(earlyStartRefusal\)\s+return new Response\(JSON\.stringify\(earlyStartRefusal\), \{\s+status: 409,/,
      );
    });
  }

  it("the hosted page's price preview creates nothing, so it is not asked", () => {
    const src = read("supabase/functions/create-checkout-session/index.ts");
    expect(src.indexOf("if (quote === true)")).toBeLessThan(
      src.indexOf("await earlyStartGate("),
    );
  });

  it("the kids seat deposit is not a course payment", () => {
    const src = read("supabase/functions/create-checkout/index.ts");
    expect(src).toMatch(/if \(!isDeposit\) \{[\s\S]*?await earlyStartGate\(/);
  });
});

describe("the box says exactly the approved text, everywhere", () => {
  it("one text, in both languages", () => {
    const text = read("src/lib/earlyStart.ts");
    expect(text).toContain(
      'ro: "Vreau să încep lecțiile înainte să treacă cele 14 zile de retragere. Înțeleg că, dacă mă retrag în acest timp, plătesc lecțiile ținute până atunci.",',
    );
    expect(text).toContain(
      'en: "I want my lessons to start before the 14-day withdrawal period ends. I understand that if I withdraw during that time, I pay for the lessons held until then.",',
    );
  });

  it("at checkout, in the sign-up form and in Contul meu", () => {
    expect(read("src/pages/Checkout.tsx")).toContain(
      '<span>{EARLY_START_BOX[english ? "en" : "ro"]}</span>',
    );
    expect(read("src/components/RegistrationFormSection.tsx")).toContain(
      '<span>{EARLY_START_BOX[lang === "en" ? "en" : "ro"]}</span>',
    );
    expect(read("src/pages/MyAccount.tsx")).toContain(
      "<span>{EARLY_START_BOX[lang]}</span>",
    );
  });
});

describe("the box at checkout", () => {
  const page = read("src/pages/Checkout.tsx");

  it("starts unticked, and the button waits for the tick", () => {
    expect(page).toContain("const [ticked, setTicked] = useState(false);");
    expect(page).toContain("disabled={!ticked}");
  });

  it("offers a later group instead", () => {
    expect(page).toContain('"Alege altă grupă"');
    expect(page).toContain('english ? "/en/courses/group" : "/cursuri/grup"');
  });

  it("every payment call carries the student's answer", () => {
    expect(page.match(/earlyStart: earlyStartAccepted,/g)?.length).toBe(2);
    expect(page).toContain("earlyStart: earlyStartNow,");
    expect(page.match(/code === "early_start_required"/g)?.length).toBe(2);
  });
});

describe("the admin and the refund", () => {
  const admin = read("supabase/functions/admin-registrations/index.ts");

  it("the refund keeps the lessons held only when the student asked", () => {
    expect(
      admin.match(
        /startedAtRequest: Boolean\(reg\.early_start_requested_at\),/g,
      )?.length,
    ).toBe(2);
    expect(
      admin.match(/"id, created_at, early_start_requested_at, /g)?.length,
    ).toBe(3);
  });

  it("the owner can record a request received by email or WhatsApp, and undo it", () => {
    const start = admin.indexOf('if (action === "set_early_start")');
    expect(start).toBeGreaterThan(0);
    const action = admin.slice(start, start + 2500);
    expect(action).toContain(
      ".update({ early_start_requested_at: on ? receivedOn : null })",
    );
    expect(action).toContain('on ? "record_early_start" : "clear_early_start"');
    expect(action).toContain('reg.form_type !== "group"');
    const sheet = read("src/components/admin/PersonSheet.tsx");
    expect(sheet).toContain("<EarlyStartConsent");
    const ui = read("src/components/admin/EarlyStartConsent.tsx");
    expect(ui).toContain('action: "set_early_start"');
    expect(ui).toContain("Înregistrează cererea primită pe email sau WhatsApp");
  });

  it("the Terms say how the request is made and that it is needed", () => {
    const terms = read("src/pages/Terms.tsx");
    expect(terms).toContain(
      "Pentru o grupă care începe în cele 14 zile, această cerere este necesară ca să intri în grupa respectivă: o faci bifând căsuța din formularul de înscriere, de la plată sau din Contul meu, ori scriindu-ne pe email sau pe WhatsApp. Dacă nu vrei, te poți înscrie la o grupă care începe mai târziu.",
    );
    expect(terms).toContain(
      "For a group that starts within the 14 days, this request is needed to join that group: you make it by ticking the box in the sign-up form, at payment or in My account, or by writing to us by email or on WhatsApp. If you would rather not, you can sign up for a group that starts later.",
    );
  });

  it("the column holds when the request was made", () => {
    const sql = read(
      "supabase/migrations/20261117120000_early_start_request.sql",
    );
    expect(sql).toContain(
      "add column if not exists early_start_requested_at timestamptz;",
    );
  });
});

// ---------------------------------------------------------------------------
// Cash, transfer and centre payers (owner, 17 Nov 2026: "the box can't reach
// them"): the request is asked for at sign-up, and the database refuses a
// sign-up from the website to such a group without it.
// ---------------------------------------------------------------------------
describe("the site's copy of the rule", () => {
  it("agrees with the payment functions' copy, day by day", async () => {
    const site = await import("@/lib/earlyStart");
    const edge = mod();
    expect(site.WITHDRAWAL_DAYS).toBe(edge.EARLY_START_DAYS);
    for (const start of [
      "2026-11-07",
      "2026-11-17",
      "2026-12-01",
      "2026-12-02",
      "2027-01-09",
      null,
    ])
      expect(site.startsInsideWithdrawal(start, TODAY)).toBe(
        edge.startsInsideWithdrawal(start, TODAY),
      );
  });

  it("writes the day the way each language does", async () => {
    const { longDay, bucharestDay } = await import("@/lib/earlyStart");
    expect(longDay("2026-12-01", "ro")).toBe("1 decembrie 2026");
    expect(longDay("2026-12-01", "en")).toBe("1 December 2026");
    // Late in the evening in Bucharest is already the next day there.
    expect(bucharestDay(new Date("2026-11-30T22:30:00Z"))).toBe("2026-12-01");
  });
});

describe("the box in the sign-up form", () => {
  const form = read("src/components/RegistrationFormSection.tsx");

  it("is shown for a group that starts within 14 days, unticked", () => {
    expect(form).toMatch(
      /const needsEarlyStart =\s+courseType === "group" &&\s+!!cohortId &&\s+\(startsInsideWithdrawal\(cohortStart\) \|\| earlyStartForced\);/,
    );
    expect(form).toContain(
      "const [earlyStartTicked, setEarlyStartTicked] = useState(false);",
    );
    expect(form).toContain('<div\n                  id="early-start"');
  });

  it("must be ticked to send the sign-up, and sends the request only then", () => {
    expect(form).toMatch(
      /if \(needsEarlyStart && !earlyStartTicked\) \{\s+fail\(\s+"early_start",/,
    );
    expect(form).toContain(
      '...(courseType === "group" && needsEarlyStart && earlyStartTicked\n          ? { early_start_requested_at: new Date().toISOString() }\n          : {}),',
    );
  });

  it("asks again when the database refuses the sign-up", () => {
    expect(form).toMatch(
      /message\.includes\("early_start_required"\)\) \{\s+setEarlyStartForced\(true\);/,
    );
  });

  it("forgets the tick when the student picks another group", () => {
    expect(form).toMatch(
      /setCohortStart\(c\?\.start_date \?\? null\);\s+setEarlyStartTicked\(false\);\s+setEarlyStartForced\(false\);/,
    );
  });

  it("knows the start day of the group a course page opens it with", () => {
    expect(read("src/pages/courses/CourseDetail.tsx")).toContain(
      "start_date: c.start_date",
    );
  });

  it("keeps the analytics events as they are", () => {
    expect(form).toMatch(
      /if \(field !== "early_start"\)\s+trackRegistrationValidationFailed\(/,
    );
  });
});

describe("the database refuses a sign-up without it", () => {
  const sql = read(
    "supabase/migrations/20261117130000_early_start_on_signup.sql",
  );

  it("records the request with its own time, never the visitor's", () => {
    expect(sql).toMatch(
      /if NEW\.early_start_requested_at is not null then\s+NEW\.early_start_requested_at := now\(\);/,
    );
  });

  it("refuses a group starting on or before day 14 without the request", () => {
    expect(sql).toContain(
      "starts <= ((now() at time zone 'Europe/Bucharest')::date + 14)",
    );
    expect(sql).toContain("raise exception 'early_start_required:");
  });

  it("leaves the admin, other courses and sign-ups without a group alone", () => {
    expect(sql).toContain("NEW.form_type is distinct from 'group'");
    expect(sql).toContain("NEW.cohort_id is null");
    expect(sql).toContain("coalesce(auth.role(), '') = 'service_role'");
  });

  it("runs before every new sign-up, and can run again", () => {
    expect(sql).toContain(
      "drop trigger if exists trg_require_early_start_request on public.registrations;",
    );
    expect(sql).toMatch(
      /create trigger trg_require_early_start_request\s+before insert on public\.registrations\s+for each row execute function public\.require_early_start_request\(\);/,
    );
    expect(sql).not.toMatch(
      /\b(update|delete)\s+(from\s+)?public\.registrations\b/i,
    );
  });
});
