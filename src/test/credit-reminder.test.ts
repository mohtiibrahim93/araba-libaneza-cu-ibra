import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeModule } from "./helpers/edge-handler";

/**
 * The credit reminder (owner, 16-17 Nov 2026; Terms, section 4): one email,
 * 30 days before credit expires, for credit whose unused part comes back in
 * money. The Romanian text is the owner's approved wording, word for word.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const TEMPLATE =
  "supabase/functions/_shared/transactional-email-templates/credit-expiry-reminder.tsx";
const mod = () =>
  loadEdgeModule("supabase/functions/_shared/credit-reminders.ts", {}) as {
    processCreditReminders: (
      db: unknown,
      send: (...a: unknown[]) => Promise<unknown>,
      now?: Date,
    ) => Promise<{ sent: number; failed: number }>;
    creditAmountLabel: (lei: number, lang: "ro" | "en") => string;
    creditDayLabel: (iso: string, lang: "ro" | "en") => string;
  };

describe("the email", () => {
  const src = read(TEMPLATE);

  it("says, in Romanian, exactly what the owner approved", () => {
    expect(src).toContain(
      "`Mai ai ${amount} credit la Centrul de Arabă Libaneză, valabil până pe ${until}. Îl poți folosi într-o grupă viitoare, îl poți da altei persoane sau îl poți transforma în lecții private (150 lei lecția). Dacă nu îl folosești până atunci, îți returnăm suma rămasă, minus comisionul de procesare Stripe. Răspunde la acest email sau scrie-ne pe WhatsApp și spune-ne ce alegi.`",
    );
    expect(src).toContain('(n ? `Bună, ${n}!` : "Bună!")');
    expect(src).toContain(
      '`Creditul tău de ${d.amount ?? ""} expiră pe ${d.until ?? ""}`',
    );
  });

  it("has the same text in English", () => {
    expect(src).toContain(
      "`You still have ${amount} of credit with Centrul de Arabă Libaneză, valid until ${until}. You can use it in a later group, give it to another person, or turn it into private lessons (150 lei a lesson). If you do not use it by then, we refund you what is left, minus the Stripe processing fee. Reply to this email or message us on WhatsApp and tell us what you choose.`",
    );
  });

  it("sends a reply to the school's inbox, not to the no-reply sender", () => {
    expect(src).toContain(
      'const CONTACT_EMAIL = "marhaba@centruldearabalibaneza.com"',
    );
    expect(src).toContain("replyTo: CONTACT_EMAIL");
    const mail = read("supabase/functions/_shared/managed-email.ts");
    expect(mail).toContain(
      "...(template.replyTo ? { reply_to: template.replyTo } : {})",
    );
    expect(
      read(
        "supabase/functions/_shared/transactional-email-templates/registry.ts",
      ),
    ).toContain('"credit-expiry-reminder": creditExpiryReminder');
  });
});

describe("amounts and dates in the email", () => {
  it("in each language's own way", () => {
    const { creditAmountLabel, creditDayLabel } = mod();
    expect(creditAmountLabel(312.5, "ro")).toBe("312,50 lei");
    expect(creditAmountLabel(312.5, "en")).toBe("312.50 lei");
    expect(creditAmountLabel(500, "ro")).toBe("500 lei");
    expect(creditAmountLabel(1500, "ro")).toBe("1.500 lei");
    expect(creditDayLabel("2027-05-25T10:00:00.000Z", "ro")).toBe(
      "25 mai 2027",
    );
    expect(creditDayLabel("2027-05-25T10:00:00.000Z", "en")).toBe(
      "25 May 2027",
    );
    // Late in the evening in Bucharest is still that day there.
    expect(creditDayLabel("2027-05-25T21:30:00.000Z", "ro")).toBe(
      "26 mai 2027",
    );
  });
});

// ---------------------------------------------------------------------------
// Who gets it, and only once
// ---------------------------------------------------------------------------
type Row = Record<string, unknown>;
function fakeDb(credits: Row[]) {
  const updates: Array<{ value: Row; filters: string[] }> = [];
  const from = (table: string) => {
    if (table !== "student_credits") throw new Error(`unexpected ${table}`);
    const tests: Array<(r: Row) => boolean> = [];
    const tags: string[] = [];
    let patch: Row | null = null;
    const q: any = {
      select: () => q,
      update: (v: Row) => ((patch = v), q),
      is: (k: string, v: unknown) => (
        tags.push(`${k} is ${v}`),
        tests.push((r) => (r[k] ?? null) === v),
        q
      ),
      eq: (k: string, v: unknown) => (
        tags.push(`${k}=${v}`),
        tests.push((r) => r[k] === v),
        q
      ),
      not: (k: string) => (tests.push((r) => r[k] != null), q),
      gt: (k: string, v: string) => (tests.push((r) => String(r[k]) > v), q),
      lte: (k: string, v: string) => (tests.push((r) => String(r[k]) <= v), q),
      then: (ok: (v: unknown) => void) => {
        const hit = credits.filter((r) => tests.every((t) => t(r)));
        if (patch) {
          for (const r of hit) Object.assign(r, patch);
          updates.push({ value: patch, filters: tags });
        }
        ok({
          data: patch ? hit.map((r) => ({ id: r["id"] })) : hit,
          error: null,
        });
      },
    };
    return q;
  };
  return { db: { from }, updates };
}

const NOW = new Date("2027-04-26T08:00:00.000Z");
const credit = (over: Row = {}): Row => ({
  id: "c1",
  holder_name: "Ana Exemplu",
  holder_email: "ana@example.test",
  amount_lei: "312.50",
  created_at: "2026-11-25T10:00:00.000Z",
  // 29 days after NOW
  expires_at: "2027-05-25T10:00:00.000Z",
  refund_at_expiry: true,
  reminder_sent_at: null,
  registrations: { language: "ro" },
  student_credit_uses: [],
  ...over,
});

describe("sending the reminder", () => {
  it("sends it once, 30 days before, with what is left and the last day", async () => {
    const rows = [
      credit({ student_credit_uses: [{ kind: "private", amount_lei: 150 }] }),
    ];
    const { db } = fakeDb(rows);
    const calls: unknown[][] = [];
    const out = await mod().processCreditReminders(
      db,
      async (...a) => void calls.push(a),
      NOW,
    );
    expect(out).toEqual({ sent: 1, failed: 0 });
    expect(calls).toEqual([
      [
        "credit-expiry-reminder",
        "ana@example.test",
        {
          templateData: {
            name: "Ana Exemplu",
            amount: "162,50 lei",
            until: "25 mai 2027",
            lang: "ro",
          },
          idempotencyKey: "credit-expiry-reminder-c1",
        },
      ],
    ]);
    expect(rows[0]!["reminder_sent_at"]).toBe(NOW.toISOString());
    // The next run finds it done.
    const again: unknown[] = [];
    await mod().processCreditReminders(
      db,
      async (...a) => void again.push(a),
      NOW,
    );
    expect(again).toEqual([]);
  });

  it("in English for a student who signed up in English", async () => {
    const { db } = fakeDb([credit({ registrations: { language: "en" } })]);
    const calls: any[] = [];
    await mod().processCreditReminders(
      db,
      async (...a) => void calls.push(a),
      NOW,
    );
    expect(calls[0][2].templateData).toMatchObject({
      amount: "312.50 lei",
      until: "25 May 2027",
      lang: "en",
    });
  });

  it("not too early, not after expiry, not when used up, not without an address", async () => {
    const rows = [
      credit({ id: "early", expires_at: "2027-06-10T10:00:00.000Z" }),
      credit({ id: "gone", expires_at: "2027-04-20T10:00:00.000Z" }),
      credit({
        id: "used",
        student_credit_uses: [{ kind: "group", amount_lei: 312.5 }],
      }),
      credit({ id: "noemail", holder_email: null }),
      credit({ id: "sent", reminder_sent_at: "2027-04-25T08:00:00.000Z" }),
    ];
    const { db } = fakeDb(rows);
    const calls: unknown[] = [];
    const out = await mod().processCreditReminders(
      db,
      async (...a) => void calls.push(a),
      NOW,
    );
    expect(out).toEqual({ sent: 0, failed: 0 });
    expect(calls).toEqual([]);
  });

  it("not for credit under the earlier Terms, whose rest is not refunded", async () => {
    const { db } = fakeDb([credit({ refund_at_expiry: false })]);
    const calls: unknown[] = [];
    await mod().processCreditReminders(
      db,
      async (...a) => void calls.push(a),
      NOW,
    );
    expect(calls).toEqual([]);
  });

  it("tries again next time when the send fails", async () => {
    const rows = [credit()];
    const { db, updates } = fakeDb(rows);
    const out = await mod().processCreditReminders(
      db,
      async () => {
        throw new Error("mail down");
      },
      NOW,
    );
    expect(out).toEqual({ sent: 0, failed: 1 });
    expect(rows[0]!["reminder_sent_at"]).toBeNull();
    // Released only where this run set it, never someone else's claim.
    expect(updates.at(-1)?.filters).toContain(
      `reminder_sent_at=${NOW.toISOString()}`,
    );
    const calls: unknown[] = [];
    await mod().processCreditReminders(
      db,
      async (...a) => void calls.push(a),
      NOW,
    );
    expect(calls.length).toBe(1);
  });

  it("claims the credit before sending, so two runs at once send one email", async () => {
    const src = read("supabase/functions/_shared/credit-reminders.ts");
    const claim = src.indexOf(".update({ reminder_sent_at: nowIso })");
    const send = src.indexOf('await send("credit-expiry-reminder"');
    expect(claim).toBeGreaterThan(0);
    expect(send).toBeGreaterThan(claim);
    expect(src.slice(claim, send)).toContain('.is("reminder_sent_at", null)');
    expect(src.slice(claim, send)).toContain("if (!claimed?.length) continue;");
  });

  it("runs with the lesson reminders, in its own try", () => {
    const reminders = read("supabase/functions/booking-reminders/index.ts");
    expect(reminders).toContain(
      'import { processCreditReminders } from "../_shared/credit-reminders.ts";',
    );
    expect(reminders).toMatch(
      /try \{\s+creditReminders = await processCreditReminders\(\s*supabase,\s*sendTemplateEmail,?\s*\);/,
    );
  });
});

describe("the admin says when it goes", () => {
  it("shows when it was sent, or when it will go by itself", () => {
    const ui = read("src/components/admin/CreditsAdmin.tsx");
    expect(ui).toContain("Reamintire trimisă pe email pe");
    expect(ui).toContain("Reamintirea pe email pleacă singură pe");
  });
});
