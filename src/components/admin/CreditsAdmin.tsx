import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import {
  CREDIT_USE_LABELS,
  type CreditState,
  type CreditUseKind,
} from "../../../supabase/functions/_shared/credit";

/**
 * Credit, per student (owner, 14 and 16 November 2026; Terms, section 4).
 *
 * When a student leaves a group after the second lesson, the unused lessons
 * of the month in progress become credit: valid 6 months, usable in a later
 * group, by another person, or as private lessons at 150 lei. A cancellation
 * made in the admin writes its credit here by itself; the owner can also add
 * one by hand. What is unused at expiry is returned in money with "Returnează
 * acum": nothing is returned by itself, and nothing here writes to the
 * student. Months granted for free ("lună acordată") are not credit and are
 * not shown here.
 */
interface CreditUse {
  id: string;
  kind: CreditUseKind;
  amount_lei: number | string;
  note: string | null;
  used_at: string;
}
interface Credit {
  id: string;
  holder_name: string;
  holder_email: string | null;
  origin: string;
  created_at: string;
  expires_at: string;
  refund_at_expiry: boolean;
  stripe_payment_id: string | null;
  note: string | null;
  uses: CreditUse[];
  state: CreditState;
}
interface RefundPreview {
  remaining_bani: number;
  fee_bani: number;
  refund_bani: number;
  refund_label: string;
  by_hand: boolean;
}

const lei = (n: number | string) =>
  `${Number(n).toLocaleString("ro-RO", { maximumFractionDigits: 2 })} lei`;
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const STATUS: Record<CreditState["status"], string> = {
  active: "Activ",
  used: "Folosit",
  refund_due: "Expirat: de returnat",
  ended: "Expirat",
};

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm";
const button =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted disabled:opacity-60";

const CreditsAdmin = () => {
  const [rows, setRows] = useState<Credit[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    holder_name: "",
    holder_email: "",
    amount_lei: "",
    origin: "",
    refund_at_expiry: true,
  });
  /** The credit a use, a transfer or a refund is being entered for. */
  const [open, setOpen] = useState<{
    id: string;
    what: "use" | "transfer" | "refund";
  } | null>(null);
  const [entry, setEntry] = useState({
    kind: "group" as "group" | "private",
    amount_lei: "",
    to_name: "",
    to_email: "",
    note: "",
    by_hand: false,
  });
  const [preview, setPreview] = useState<RefundPreview | null>(null);

  const load = useCallback(async () => {
    const { data, error: fnError } = await invokeAdmin<{
      data?: Credit[];
      error?: string;
    }>({ action: "list_credits" });
    if (fnError || data?.error) {
      setError(data?.error ?? "Nu am putut încărca creditele.");
      return;
    }
    setError("");
    setRows(data?.data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Runs one admin action, then reloads the list. */
  const run = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    const { data, error: fnError } = await invokeAdmin<{
      error?: string;
      data?: RefundPreview;
    }>(body);
    setBusy(false);
    if (fnError || data?.error) {
      setError(data?.error ?? "Nu am putut salva.");
      return null;
    }
    return data ?? {};
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run({
      action: "add_credit",
      ...form,
      amount_lei: Number(form.amount_lei.replace(",", ".")),
    });
    if (!ok) return;
    setAdding(false);
    setForm({
      holder_name: "",
      holder_email: "",
      amount_lei: "",
      origin: "",
      refund_at_expiry: true,
    });
    await load();
  };

  const start = async (id: string, what: "use" | "transfer" | "refund") => {
    setOpen({ id, what });
    setPreview(null);
    setEntry({
      kind: "group",
      amount_lei: "",
      to_name: "",
      to_email: "",
      note: "",
      by_hand: false,
    });
    if (what === "refund") {
      const res = await run({ action: "preview_refund_credit", credit_id: id });
      setPreview(res?.data ?? null);
    }
  };

  const save = async () => {
    if (!open) return;
    const amount = Number(entry.amount_lei.replace(",", "."));
    const ok =
      open.what === "use"
        ? await run({
            action: "use_credit",
            credit_id: open.id,
            kind: entry.kind,
            amount_lei: amount,
            note: entry.note,
          })
        : open.what === "transfer"
          ? await run({
              action: "transfer_credit",
              credit_id: open.id,
              amount_lei: amount,
              to_name: entry.to_name,
              to_email: entry.to_email,
              note: entry.note,
            })
          : await run({
              action: "refund_credit",
              credit_id: open.id,
              by_hand: entry.by_hand,
              note: entry.note,
            });
    if (!ok) return;
    setOpen(null);
    await load();
  };

  const retryPreview = async (byHand: boolean) => {
    if (!open) return;
    setEntry((v) => ({ ...v, by_hand: byHand }));
    const res = await run({
      action: "preview_refund_credit",
      credit_id: open.id,
      by_hand: byHand,
    });
    setPreview(res?.data ?? null);
  };

  if (!rows && !error)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă creditele…
      </p>
    );

  const list = rows ?? [];
  const due = list.filter((c) => c.state.status === "refund_due");
  const soon = list.filter(
    (c) => c.state.status === "active" && c.state.daysLeft <= 30,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-foreground">Credite</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Creditul fiecărui cursant: cât, de unde vine, până când e valabil și
            cum a fost folosit. Valabil 6 luni; la expirare, ce a rămas se
            returnează cu „Returnează acum”. Nimic nu se returnează singur.
            Lunile acordate nu sunt credit și nu apar aici.
          </p>
        </div>
        <button
          type="button"
          className={button}
          onClick={() => setAdding((v) => !v)}
        >
          <Plus className="h-4 w-4" /> Adaugă credit
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {(due.length > 0 || soon.length > 0) && (
        <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {due.length > 0 && (
            <>
              <strong>{due.length}</strong>{" "}
              {due.length === 1 ? "credit expirat" : "credite expirate"} de
              returnat.{" "}
            </>
          )}
          {soon.length > 0 && (
            <>
              <strong>{soon.length}</strong> expiră în cel mult 30 de zile.
            </>
          )}
        </p>
      )}

      {adding && (
        <form
          onSubmit={add}
          className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2"
        >
          <label className="text-sm font-semibold">
            Al cui este
            <input
              className={`${field} mt-1`}
              required
              maxLength={160}
              value={form.holder_name}
              onChange={(e) =>
                setForm({ ...form, holder_name: e.target.value })
              }
            />
          </label>
          <label className="text-sm font-semibold">
            Email (pentru reamintire)
            <input
              className={`${field} mt-1`}
              type="email"
              maxLength={255}
              value={form.holder_email}
              onChange={(e) =>
                setForm({ ...form, holder_email: e.target.value })
              }
            />
          </label>
          <label className="text-sm font-semibold">
            Suma (lei)
            <input
              className={`${field} mt-1`}
              required
              inputMode="decimal"
              value={form.amount_lei}
              onChange={(e) => setForm({ ...form, amount_lei: e.target.value })}
            />
          </label>
          <label className="text-sm font-semibold">
            De unde vine
            <input
              className={`${field} mt-1`}
              required
              maxLength={300}
              placeholder="ex.: 5 lecții neținute din luna 2"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.refund_at_expiry}
              onChange={(e) =>
                setForm({ ...form, refund_at_expiry: e.target.checked })
              }
            />
            La expirare, ce a rămas se returnează în bani (înscrieri de după 16
            noiembrie 2026)
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className={button} disabled={busy}>
              Salvează creditul
            </button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Niciun credit încă. Apare aici singur când anulezi un cursant după
          lecția a doua.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {c.holder_name}
                  </p>
                  {c.holder_email && (
                    <p className="text-sm text-muted-foreground">
                      {c.holder_email}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.origin}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">
                    {lei(c.state.remainingLei)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    din {lei(c.state.amountLei)}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      c.state.status === "refund_due"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {STATUS[c.state.status]}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Dat pe {day(c.created_at)} · valabil până pe {day(c.expires_at)}
                {c.state.status === "active" &&
                  ` (${c.state.daysLeft} ${c.state.daysLeft === 1 ? "zi" : "zile"})`}
                {c.state.status === "active" && c.state.privateLessons > 0
                  ? ` · ajunge pentru ${c.state.privateLessons} ${c.state.privateLessons === 1 ? "lecție privată" : "lecții private"}`
                  : ""}
              </p>
              {c.uses.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {c.uses.map((u) => (
                    <li key={u.id}>
                      {day(u.used_at)} · {CREDIT_USE_LABELS[u.kind] ?? u.kind}:{" "}
                      {lei(u.amount_lei)}
                      {u.note ? ` · ${u.note}` : ""}
                    </li>
                  ))}
                </ul>
              )}

              {c.state.remainingLei > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.state.status === "active" && (
                    <>
                      <button
                        type="button"
                        className={button}
                        disabled={busy}
                        onClick={() => void start(c.id, "use")}
                      >
                        Folosește
                      </button>
                      <button
                        type="button"
                        className={button}
                        disabled={busy}
                        onClick={() => void start(c.id, "transfer")}
                      >
                        Dă-l altei persoane
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className={`${button} ${c.state.status === "refund_due" ? "border-primary text-primary" : ""}`}
                    disabled={busy}
                    onClick={() => void start(c.id, "refund")}
                  >
                    Returnează acum
                  </button>
                </div>
              )}

              {open?.id === c.id && (
                <div className="mt-3 space-y-3 rounded-lg bg-muted/40 p-3">
                  {open.what === "refund" ? (
                    preview ? (
                      <>
                        <p className="text-sm text-foreground">
                          Rămas: {lei(preview.remaining_bani / 100)} − comision
                          Stripe: {lei(preview.fee_bani / 100)} ={" "}
                          <strong>{preview.refund_label}</strong>{" "}
                          {preview.by_hand
                            ? "de returnat de tine, manual (transfer sau cash)."
                            : "înapoi pe cardul cursantului."}
                        </p>
                        {c.stripe_payment_id && (
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={entry.by_hand}
                              onChange={(e) =>
                                void retryPreview(e.target.checked)
                              }
                            />
                            L-am returnat manual, nu pe card
                          </label>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Se calculează suma…
                      </p>
                    )
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {open.what === "use" ? (
                        <label className="text-sm font-semibold">
                          La ce
                          <select
                            className={`${field} mt-1`}
                            value={entry.kind}
                            onChange={(e) =>
                              setEntry({
                                ...entry,
                                kind: e.target.value as "group" | "private",
                              })
                            }
                          >
                            <option value="group">O grupă viitoare</option>
                            <option value="private">
                              Lecții private (150 lei lecția)
                            </option>
                          </select>
                        </label>
                      ) : (
                        <>
                          <label className="text-sm font-semibold">
                            Cui
                            <input
                              className={`${field} mt-1`}
                              maxLength={160}
                              value={entry.to_name}
                              onChange={(e) =>
                                setEntry({ ...entry, to_name: e.target.value })
                              }
                            />
                          </label>
                          <label className="text-sm font-semibold">
                            Emailul lui (opțional)
                            <input
                              className={`${field} mt-1`}
                              type="email"
                              maxLength={255}
                              value={entry.to_email}
                              onChange={(e) =>
                                setEntry({ ...entry, to_email: e.target.value })
                              }
                            />
                          </label>
                        </>
                      )}
                      <label className="text-sm font-semibold">
                        Suma (lei), cel mult {lei(c.state.remainingLei)}
                        <input
                          className={`${field} mt-1`}
                          inputMode="decimal"
                          value={entry.amount_lei}
                          onChange={(e) =>
                            setEntry({ ...entry, amount_lei: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  )}
                  <label className="block text-sm font-semibold">
                    Notă (opțional)
                    <input
                      className={`${field} mt-1`}
                      maxLength={300}
                      value={entry.note}
                      onChange={(e) =>
                        setEntry({ ...entry, note: e.target.value })
                      }
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`${button} bg-foreground text-background hover:bg-foreground/90`}
                      disabled={busy || (open.what === "refund" && !preview)}
                      onClick={() => void save()}
                    >
                      {open.what === "refund"
                        ? "Returnează"
                        : open.what === "transfer"
                          ? "Transferă"
                          : "Salvează"}
                    </button>
                    <button
                      type="button"
                      className={button}
                      onClick={() => setOpen(null)}
                    >
                      Renunță
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CreditsAdmin;
