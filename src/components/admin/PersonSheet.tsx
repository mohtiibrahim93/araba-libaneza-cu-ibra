import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Gamepad2, Loader2, Mail, MessageCircle, Phone, X } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";
import {
  formTypeLabels,
  LEAD_STATUSES,
  leadStatusLabels,
  paymentStatusLabels,
  type LeadStatus,
  type Registration,
} from "./types";

/**
 * One person, on one page (October 2026 redesign).
 *
 * Everything the admin already knew about someone was spread over three tabs:
 * the registration and its status in Înscrieri, where they are in Parcurs, and
 * their level test in Elevi cu cont. This puts it together, with the three ways
 * to reach them on top. It only reads, plus the status change the table
 * already makes; refunds, cancellations and deletion stay in the table, where
 * their confirmations are.
 */

interface Progress {
  email: string | null;
  placement: { level?: string; date?: string } | null;
  xp: number;
  rounds: number;
  items_seen: number;
  last_played_at: string | null;
}

// Loaded once per visit: the same list Elevi cu cont shows.
let progressCache: Promise<Progress[]> | null = null;
const loadProgress = () => {
  progressCache ??= invokeAdmin<{ data?: Progress[] }>({ action: "list_student_progress" }).then(
    ({ data, error }) => {
      if (error) {
        progressCache = null;
        return [];
      }
      return data?.data ?? [];
    },
  );
  return progressCache;
};

const fmt = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("ro-RO", { timeZone: "Europe/Bucharest", day: "numeric", month: "short", year: "numeric" })
    : "";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const waLink = (phone: string) => `https://wa.me/${phone.replace(/[^\d]/g, "")}`;

const CONTACTED: LeadStatus[] = ["contacted", "qualified", "converted", "no_response"];

interface Props {
  person: Registration | null;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  updating: boolean;
  onShowInTable: () => void;
}

const PersonSheet = ({ person, onClose, onStatusChange, updating, onShowInTable }: Props) => {
  const [progress, setProgress] = useState<Progress | null | undefined>(undefined);

  useEffect(() => {
    setProgress(undefined);
    const email = person?.email?.trim().toLowerCase();
    if (!email) {
      setProgress(null);
      return;
    }
    let cancelled = false;
    void loadProgress().then((rows) => {
      if (!cancelled) setProgress(rows.find((r) => r.email?.trim().toLowerCase() === email) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [person?.email]);

  const status = (person?.lead_status || "new") as LeadStatus;
  const paid = person?.payment_status === "paid" || !!person?.paid_at;
  const steps = person
    ? [
        { label: "Cerere trimisă", done: true, date: fmt(person.created_at) },
        { label: "Contactat", done: CONTACTED.includes(status) },
        { label: "Plătit", done: paid, date: fmt(person.paid_at) },
        { label: "Înscris la curs", done: status === "converted" },
      ]
    : [];
  const next = steps.findIndex((s) => !s.done);

  const history = person
    ? [
        { what: `Formular „${formTypeLabels[person.form_type] ?? person.form_type}” trimis`, when: person.created_at },
        person.paid_at && { what: "Plată primită", when: person.paid_at },
        person.refunded_at && { what: "Rambursat", when: person.refunded_at },
        person.canceled_at && { what: "Abonament anulat", when: person.canceled_at },
        progress?.placement?.date && { what: `Test de nivel în Jocul Yalla: ${progress.placement.level ?? "—"}`, when: progress.placement.date },
      ]
        .filter((h): h is { what: string; when: string } => !!h)
        .sort((a, b) => b.when.localeCompare(a.when))
    : [];

  return (
    <DialogPrimitive.Root open={!!person} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content className="admin-theme fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col overflow-y-auto bg-admin-canvas text-foreground shadow-2xl focus:outline-none sm:border-l sm:border-border">
          {person && (
            <>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-admin-nav/95 px-4 py-2 backdrop-blur">
                <DialogPrimitive.Description className="text-sm font-semibold text-muted-foreground">
                  Fișa cursantului
                </DialogPrimitive.Description>
                <DialogPrimitive.Close
                  aria-label="Închide"
                  className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </div>

              <div className="flex flex-col gap-5 px-4 py-5 sm:px-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-green font-display text-xl font-bold text-white">
                    {initials(person.name)}
                  </span>
                  <div className="min-w-0">
                    <DialogPrimitive.Title className="font-display text-2xl font-semibold leading-tight">
                      {person.name}
                    </DialogPrimitive.Title>
                    <p className="text-sm text-muted-foreground">
                      {[
                        formTypeLabels[person.form_type] ?? person.form_type,
                        person.format,
                        person.track_preference === "arabizi"
                          ? "arabizi"
                          : person.track_preference === "arabic_script"
                            ? "alfabet arab"
                            : null,
                        person.child_age ? `copil ${person.child_age}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>

                {person.anonymized_at ? (
                  <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                    Datele personale au fost șterse (GDPR) pe {fmt(person.anonymized_at)}.
                  </p>
                ) : (
                  <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
                    {person.phone ? (
                      <a
                        href={waLink(person.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-brand-green font-semibold text-white hover:opacity-90"
                      >
                        <MessageCircle className="h-[18px] w-[18px]" aria-hidden /> WhatsApp
                      </a>
                    ) : (
                      <span />
                    )}
                    {person.phone ? (
                      <a
                        href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}
                        className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-border bg-card font-semibold hover:border-brand-green/60"
                      >
                        <Phone className="h-4 w-4" aria-hidden /> Sună
                      </a>
                    ) : (
                      <span />
                    )}
                    {person.email ? (
                      <a
                        href={`mailto:${person.email}`}
                        className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-border bg-card font-semibold hover:border-brand-green/60"
                      >
                        <Mail className="h-4 w-4" aria-hidden /> Email
                      </a>
                    ) : (
                      <span />
                    )}
                  </div>
                )}

                <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    Stare
                    <span className="relative">
                      <select
                        value={status}
                        disabled={updating}
                        onChange={(e) => onStatusChange(person.id, e.target.value as LeadStatus)}
                        className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base text-foreground"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {leadStatusLabels[s]}
                          </option>
                        ))}
                      </select>
                      {updating && <Loader2 className="absolute right-9 top-3.5 h-5 w-5 animate-spin text-muted-foreground" />}
                    </span>
                  </label>
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    Plată
                    <span className="flex h-12 items-center rounded-xl bg-muted px-3 text-base font-semibold text-foreground">
                      {person.payment_status ? paymentStatusLabels[person.payment_status] ?? person.payment_status : "—"}
                    </span>
                  </div>
                </div>

                <section className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Parcurs</h2>
                  <ol className="flex flex-col">
                    {steps.map((s, i) => (
                      <li key={s.label} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "h-3.5 w-3.5 rounded-full border-2",
                              s.done
                                ? "border-brand-green bg-brand-green dark:border-primary dark:bg-primary"
                                : i === next
                                  ? "border-amber-600 bg-card"
                                  : "border-border bg-card",
                            )}
                          />
                          {i < steps.length - 1 && <span className="h-6 w-0.5 bg-border" />}
                        </div>
                        <span
                          className={cn(
                            "-mt-0.5 text-sm",
                            s.done ? "font-semibold" : i === next ? "font-semibold text-admin-warn-fg" : "text-muted-foreground",
                          )}
                        >
                          {s.label}
                          {s.done && s.date ? ` · ${s.date}` : !s.done && i === next ? " — urmează" : ""}
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="space-y-1.5 rounded-2xl border border-border bg-card p-4">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gamepad2 className="h-4 w-4" aria-hidden /> Jocul Yalla · cont cu același email
                  </p>
                  {progress === undefined ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Se caută…
                    </p>
                  ) : progress ? (
                    <>
                      <p className="font-display text-xl font-semibold">
                        Test de nivel: {progress.placement?.level ?? "nefăcut"}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 text-sm">
                        <span className="rounded-full bg-muted px-2.5 py-1">{progress.xp} XP</span>
                        <span className="rounded-full bg-muted px-2.5 py-1">{progress.rounds} runde</span>
                        <span className="rounded-full bg-muted px-2.5 py-1">{progress.items_seen} expresii</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm">Nu are cont în joc cu acest email.</p>
                  )}
                </section>

                {!person.anonymized_at && (
                  <section className="space-y-1.5 rounded-2xl border border-border bg-card p-4 text-sm">
                    <p className="text-muted-foreground">Contact</p>
                    {person.phone && <p className="font-semibold">{person.phone}</p>}
                    {person.email && <p className="break-all font-semibold">{person.email}</p>}
                    {person.center && <p>Centru: {person.center}</p>}
                  </section>
                )}

                {person.notes && (
                  <section className="space-y-1.5 rounded-2xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Mesajul lor</p>
                    <p className="whitespace-pre-wrap text-[0.9375rem]">{person.notes}</p>
                  </section>
                )}

                <section className="space-y-1">
                  <h2 className="pb-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Istoric</h2>
                  {history.map((h) => (
                    <div key={h.what + h.when} className="flex justify-between gap-3 border-t border-border/70 py-2 text-sm">
                      <span>{h.what}</span>
                      <span className="shrink-0 text-muted-foreground">{fmt(h.when)}</span>
                    </div>
                  ))}
                </section>

                <button
                  type="button"
                  onClick={onShowInTable}
                  className="min-h-12 rounded-xl border border-border bg-card font-semibold hover:border-brand-green/60"
                >
                  Plăți, rambursări și ștergere: vezi în Înscrieri
                </button>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default PersonSheet;
