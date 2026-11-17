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

describe("the box at checkout", () => {
  const page = read("src/pages/Checkout.tsx");

  it("says exactly the approved text, in both languages", () => {
    expect(page).toContain(
      '"Vreau să încep lecțiile înainte să treacă cele 14 zile de retragere. Înțeleg că, dacă mă retrag în acest timp, plătesc lecțiile ținute până atunci."',
    );
    expect(page).toContain(
      '"I want my lessons to start before the 14-day withdrawal period ends. I understand that if I withdraw during that time, I pay for the lessons held until then."',
    );
  });

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
      "Pentru o grupă care începe în cele 14 zile, această cerere se face bifând căsuța de la plată și este necesară ca să intri în grupa respectivă; dacă nu vrei, te poți înscrie la o grupă care începe mai târziu.",
    );
    expect(terms).toContain(
      "For a group that starts within the 14 days, you make this request by ticking the box at payment, and it is needed to join that group; if you would rather not, you can sign up for a group that starts later.",
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
