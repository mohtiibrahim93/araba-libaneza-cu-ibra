import { useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { toast } from "@/hooks/use-toast";
import {
  GROUP_COURSE_MONTHS,
  GROUP_FULL_COURSE_DISCOUNT,
  ONLINE_PRICES,
  formatLei,
  priceFor,
} from "@/lib/pricing";
import {
  MANUAL_METHODS,
  MONTH_METHOD_LABELS,
  MONTH_STATUS_LABELS,
  groupMonths,
  type GroupMonthsSummary,
  type ManualMethod,
} from "../../../supabase/functions/_shared/group-months";

/**
 * A group student's months, one by one, and the panel that records a payment
 * (owner, 4 Nov 2026).
 *
 * Each month is paid online (card on the site, recorded by Stripe as "Card
 * online"), paid outside the site (Revolut, bank transfer, card terminal,
 * cash, another method), granted free ("Lună acordată") or unpaid. A manual
 * payment stores the method, the amount, the date the money arrived, the
 * month(s) it covers and an optional note (admin-registrations:
 * record_group_payment). The status ("Plătit la zi" / "Neplătit") comes from
 * supabase/functions/_shared/group-months.ts, the rule every screen uses.
 */
export interface GroupPaymentRow {
  id: string;
  name: string;
  level?: string | null;
  format?: string | null;
  cohort?: {
    level: string | null;
    format: string | null;
    start_date?: string | null;
  } | null;
  months_paid?: number | null;
  months_total?: number | null;
  offline_paid_lei?: number | null;
  credit_months?: number | null;
  payment_plan?: "monthly" | "full" | null;
  payment_months?: GroupMonthsSummary | null;
}

type Level = keyof typeof GROUP_COURSE_MONTHS;

export function groupPrices(r: GroupPaymentRow) {
  const level = ((r.cohort?.level ?? r.level ?? "A1").toUpperCase() ||
    "A1") as Level;
  const format =
    (r.cohort?.format ?? r.format) === "fizic" ? "fizic" : "online";
  const monthly = priceFor(
    ONLINE_PRICES.groupMonthly[level] ?? ONLINE_PRICES.groupMonthly.A1,
    format,
  );
  const months = GROUP_COURSE_MONTHS[level] ?? GROUP_COURSE_MONTHS.A1;
  const full = Math.round(monthly * months * (1 - GROUP_FULL_COURSE_DISCOUNT));
  return { monthly, months, full };
}

/** The month summary the server sent, or one built from what the row holds. */
export function monthsOf(r: GroupPaymentRow): GroupMonthsSummary {
  if (r.payment_months) return r.payment_months;
  const { months } = groupPrices(r);
  return groupMonths({
    total: r.months_total ?? months,
    startDate: r.cohort?.start_date ?? null,
    rows: [],
  });
}

/** "Plătit la zi" / "Neplătit" for a group student. */
export function groupMonthStatusLabel(r: GroupPaymentRow): string {
  return MONTH_STATUS_LABELS[monthsOf(r).status];
}

/**
 * "2/4 luni acoperite · 1 acordată · 500 lei primiți" / null when nothing yet.
 * Months granted count in the months covered, not in the lei.
 */
export function groupPaymentSummary(r: GroupPaymentRow): string | null {
  const s = monthsOf(r);
  if (s.covered === 0) return null;
  const parts = [`${s.covered}/${s.total} luni acoperite`];
  if (s.granted)
    parts.push(`${s.granted} ${s.granted === 1 ? "acordată" : "acordate"}`);
  if (r.offline_paid_lei)
    parts.push(
      `${formatLei(r.offline_paid_lei)} lei primiți în afara site-ului`,
    );
  return parts.join(" · ");
}

const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString(
        "ro-RO",
        { day: "numeric", month: "short", timeZone: "Europe/Bucharest" },
      )
    : "";

const todayIso = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(
    new Date(),
  );

type Kind = "month" | "full" | "credit";

export default function GroupPayment({
  row,
  onDone,
}: {
  row: GroupPaymentRow;
  onDone?: (() => void) | undefined;
}) {
  const { monthly, full } = groupPrices(row);
  const s = monthsOf(row);
  const open = s.months.filter((m) => m.state === "unpaid");
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<Kind>("month");
  const [method, setMethod] = useState<ManualMethod | null>(null);
  const [from, setFrom] = useState(s.nextUncovered ?? 1);
  const [count, setCount] = useState(1);
  const [amount, setAmount] = useState(String(monthly));
  const [paidOn, setPaidOn] = useState(todayIso());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Consecutive open months from `from`: how many one payment can cover.
  const maxCount = (() => {
    let n = 0;
    for (let m = from; m <= s.total; m++) {
      if (s.months[m - 1]?.state !== "unpaid") break;
      n++;
    }
    return Math.max(1, n);
  })();

  const pick = (k: Kind) => {
    setKind(k);
    setCount(1);
    setAmount(String(k === "full" ? full : k === "credit" ? 0 : monthly));
  };

  const save = async () => {
    const value = kind === "credit" ? 0 : Number(amount.replace(",", "."));
    if (kind !== "credit") {
      if (!method) {
        toast({ title: "Alege cum a plătit.", variant: "destructive" });
        return;
      }
      if (!Number.isFinite(value) || value <= 0) {
        toast({ title: "Scrie suma primită.", variant: "destructive" });
        return;
      }
      if (!paidOn || paidOn > todayIso()) {
        toast({
          title: "Alege data în care au ajuns banii (nu în viitor).",
          variant: "destructive",
        });
        return;
      }
    }
    setSaving(true);
    try {
      const { data, error } = await invokeAdmin({
        action: "record_group_payment",
        id: row.id,
        kind,
        method: kind === "credit" ? "credit" : method,
        amount_lei: value,
        month_from: kind === "full" ? 1 : from,
        months: kind === "month" ? count : 1,
        paid_on: kind === "credit" ? null : paidOn,
        note: note.trim() || null,
      });
      if (error || data?.error)
        throw new Error(data?.error || "Plata nu a putut fi salvată.");
      const range =
        data.month_from === data.month_to
          ? `luna ${data.month_from}`
          : `lunile ${data.month_from}–${data.month_to}`;
      toast({
        title:
          kind === "credit"
            ? `${row.name}: ${range} acordată, fără plată`
            : `${row.name}: ${range} plătită (${formatLei(value)} lei, ${MONTH_METHOD_LABELS[method!]})`,
      });
      setEditing(false);
      setNote("");
      onDone?.();
    } catch (err) {
      toast({
        title:
          err instanceof Error ? err.message : "Plata nu a putut fi salvată.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const chip = (active: boolean) =>
    `min-h-11 rounded-xl border px-3 ${active ? "border-primary bg-primary/10 font-semibold" : "border-border"}`;

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            s.status === "up_to_date"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 text-red-700 dark:text-red-400"
          }`}
        >
          {MONTH_STATUS_LABELS[s.status]}
        </span>
        {groupPaymentSummary(row) && (
          <span className="text-muted-foreground">
            {groupPaymentSummary(row)}
          </span>
        )}
      </div>

      <ol className="divide-y divide-border rounded-xl border border-border">
        {s.months.map((m) => (
          <li
            key={m.month}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3 py-2"
          >
            <span className="font-medium">Luna {m.month}</span>
            <span
              className={
                m.state === "unpaid"
                  ? m.due
                    ? "font-semibold text-red-700 dark:text-red-400"
                    : "text-muted-foreground"
                  : "text-foreground"
              }
            >
              {m.state === "unpaid"
                ? m.due
                  ? "Neplătită"
                  : `De plătit din ${fmtDate(m.dueFrom)}`
                : m.state === "granted"
                  ? "Lună acordată · fără plată"
                  : `${MONTH_METHOD_LABELS[m.method!]} · ${fmtDate(m.paid_at)}`}
              {m.note ? ` · ${m.note}` : ""}
            </span>
          </li>
        ))}
      </ol>

      {open.length === 0 ? (
        <p className="text-muted-foreground">Toate lunile sunt acoperite.</p>
      ) : !editing ? (
        <button
          type="button"
          onClick={() => {
            setFrom(s.nextUncovered ?? 1);
            pick("month");
            setEditing(true);
          }}
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-semibold hover:border-brand-green/60"
        >
          Înregistrează o plată / lună acordată
        </button>
      ) : (
        <fieldset className="space-y-3 rounded-xl border border-border p-3">
          <legend className="px-1 text-xs font-semibold text-muted-foreground">
            Plată pentru {row.name}
          </legend>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Ce înregistrezi"
          >
            {(
              [
                ["month", "Plată pentru o lună sau mai multe"],
                ...(s.covered === 0
                  ? ([
                      ["full", `Integral −15% · ${formatLei(full)} lei`],
                    ] as const)
                  : []),
                ["credit", "Lună acordată · fără plată"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => pick(k)}
                className={chip(kind === k)}
              >
                {label}
              </button>
            ))}
          </div>

          {kind !== "full" && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2">
                {kind === "credit" ? "Luna" : "De la luna"}
                <select
                  value={from}
                  onChange={(e) => {
                    setFrom(Number(e.target.value));
                    setCount(1);
                    if (kind === "month") setAmount(String(monthly));
                  }}
                  className="h-11 rounded-xl border border-input bg-background px-3"
                >
                  {open.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.month}
                    </option>
                  ))}
                </select>
              </label>
              {kind === "month" && (
                <label className="flex items-center gap-2">
                  Câte luni
                  <select
                    value={count}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setCount(n);
                      setAmount(String(monthly * n));
                    }}
                    className="h-11 rounded-xl border border-input bg-background px-3"
                  >
                    {Array.from({ length: maxCount }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              )}
            </div>
          )}

          {kind === "credit" ? (
            <p className="text-xs text-muted-foreground">
              O lună acoperită printr-o înțelegere (de exemplu, din cursul
              anterior). Nu e o încasare: nu apare la bani.
            </p>
          ) : (
            <>
              <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="Cum a plătit"
              >
                {MANUAL_METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={method === m}
                    onClick={() => setMethod(m)}
                    className={chip(method === m)}
                  >
                    {MONTH_METHOD_LABELS[m]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2">
                  Suma primită
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-11 w-28 rounded-xl border border-input bg-background px-3"
                  />
                  lei
                </label>
                <label className="flex items-center gap-2">
                  Primită pe
                  <input
                    type="date"
                    value={paidOn}
                    max={todayIso()}
                    onChange={(e) => setPaidOn(e.target.value)}
                    className="h-11 rounded-xl border border-input bg-background px-3"
                  />
                </label>
              </div>
            </>
          )}
          <label className="flex flex-col gap-1">
            Notă (opțional)
            <input
              value={note}
              maxLength={500}
              onChange={(e) => setNote(e.target.value)}
              className="h-11 rounded-xl border border-input bg-background px-3"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving
                ? "Se salvează…"
                : kind === "credit"
                  ? "Salvează luna acordată"
                  : "Salvează plata"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex min-h-11 items-center rounded-xl border border-border px-4"
            >
              Renunță
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Plățile cu cardul pe site se trec singure, ca „Card online”.
            Înregistrează aici doar banii care au ajuns la tine.
          </p>
        </fieldset>
      )}
    </div>
  );
}
