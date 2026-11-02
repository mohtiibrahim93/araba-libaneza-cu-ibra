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

/**
 * Cash or bank-transfer payment for a group course (owner, 1 Nov 2026).
 *
 * One month, or the whole course with its −15%, cash or transfer, and the
 * amount received — prefilled from the price table and editable, because the
 * owner sometimes agrees a different sum. admin-registrations:
 * record_group_payment stores it and advances the months paid.
 */
export interface GroupPaymentRow {
  id: string;
  name: string;
  level?: string | null;
  format?: string | null;
  cohort?: { level: string | null; format: string | null } | null;
  months_paid?: number | null;
  months_total?: number | null;
  offline_paid_lei?: number | null;
  payment_plan?: "monthly" | "full" | null;
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

/** "Lunar 2/4 luni · 1.000 lei" / "Integral · 1.700 lei" / null. */
export function groupPaymentSummary(r: GroupPaymentRow): string | null {
  const total = r.months_total ?? null;
  const paid = r.months_paid ?? 0;
  const lei = r.offline_paid_lei
    ? ` · ${formatLei(r.offline_paid_lei)} lei`
    : "";
  if (r.payment_plan === "full") return `Integral${lei}`;
  if (total && paid > 0) return `Lunar ${paid}/${total} luni${lei}`;
  return null;
}

export default function GroupPayment({
  row,
  onDone,
}: {
  row: GroupPaymentRow;
  onDone?: (() => void) | undefined;
}) {
  const { monthly, months, full } = groupPrices(row);
  const paid = row.months_paid ?? 0;
  const total = row.months_total ?? months;
  const done = paid >= total;
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"month" | "full">("month");
  const [method, setMethod] = useState<"cash" | "transfer">("cash");
  const [amount, setAmount] = useState(String(monthly));
  const [saving, setSaving] = useState(false);
  const summary = groupPaymentSummary(row);

  const pick = (k: "month" | "full") => {
    setKind(k);
    setAmount(String(k === "full" ? full : monthly));
  };

  const save = async () => {
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      toast({ title: "Scrie suma primită.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await invokeAdmin({
        action: "record_group_payment",
        id: row.id,
        kind,
        method,
        amount_lei: value,
      });
      if (error || data?.error)
        throw new Error(data?.error || "Plata nu a putut fi salvată.");
      toast({
        title:
          kind === "full"
            ? `${row.name}: plătit integral (${formatLei(value)} lei)`
            : `${row.name}: luna ${data.months_paid}/${data.months_total} plătită (${formatLei(value)} lei)`,
      });
      setOpen(false);
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

  return (
    <div className="space-y-2 text-sm">
      {summary && <p className="font-medium text-foreground">{summary}</p>}
      {done ? (
        <p className="text-muted-foreground">Toate lunile sunt plătite.</p>
      ) : !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 font-semibold hover:border-brand-green/60"
        >
          Încasare cash / transfer
        </button>
      ) : (
        <fieldset className="space-y-3 rounded-xl border border-border p-3">
          <legend className="px-1 text-xs font-semibold text-muted-foreground">
            Încasare pentru {row.name}
          </legend>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Ce a plătit"
          >
            {(
              [
                [
                  "month",
                  `1 lună (${paid + 1}/${total}) · ${formatLei(monthly)} lei`,
                ],
                ...(paid === 0
                  ? ([
                      ["full", `Integral −15% · ${formatLei(full)} lei`],
                    ] as const)
                  : []),
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => pick(k)}
                className={`min-h-11 rounded-xl border px-3 ${kind === k ? "border-primary bg-primary/10 font-semibold" : "border-border"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Cum a plătit"
          >
            {(
              [
                ["cash", "Cash"],
                ["transfer", "Transfer bancar"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={method === m}
                onClick={() => setMethod(m)}
                className={`min-h-11 rounded-xl border px-3 ${method === m ? "border-primary bg-primary/10 font-semibold" : "border-border"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex flex-wrap items-center gap-2">
            Suma primită
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 w-28 rounded-xl border border-input bg-background px-3"
            />
            lei
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Se salvează…" : "Salvează plata"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center rounded-xl border border-border px-4"
            >
              Renunță
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Folosește doar după ce banii au ajuns la tine.
          </p>
        </fieldset>
      )}
    </div>
  );
}
