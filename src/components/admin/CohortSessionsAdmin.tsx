import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Loader2, RefreshCw } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ErrorNote } from "./ui";

/**
 * Grupe › Lecțiile grupelor (October 2026).
 *
 * The running groups' lessons, read from Google Calendar ("<curs>-L<N>")
 * by admin-registrations: sync_cohort_sessions. Reading is safe and happens on
 * open; adding the remaining lessons to the calendar is a separate button with
 * a preview and a confirmation, because it writes to the owner's calendar.
 */
interface Planned {
  lesson_number: number;
  date: string;
  start_time: string;
  end_time: string;
}
interface Result {
  cohort_id: string;
  calendar_title: string;
  total_lessons: number | null;
  found: number;
  last_lesson: { number: number; starts_at: string } | null;
  missing_meetings: boolean;
  /** Guests of the group's latest lesson; the new lessons invite them too. */
  guests?: string[];
  plan: Planned[];
  created: number[];
}

const TZ = "Europe/Bucharest";
const fmtDay = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const CohortSessionsAdmin = () => {
  const [rows, setRows] = useState<Result[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  // One group, or "all" of them.
  const [confirm, setConfirm] = useState<Result | "all" | null>(null);
  const [extra, setExtra] = useState("");

  const sync = useCallback(async (cohortId?: string, addRemaining = false, extraGuests: string[] = []) => {
    setBusy(cohortId ?? "all");
    setError("");
    try {
      const { data, error: err } = await invokeAdmin<{ data?: Result[]; error?: string }>({
        action: "sync_cohort_sessions",
        ...(cohortId ? { cohort_id: cohortId } : {}),
        add_remaining: addRemaining,
        ...(extraGuests.length ? { extra_guests: extraGuests } : {}),
      });
      if (err || data?.error) throw new Error(data?.error ?? "Sincronizarea a eșuat.");
      const fresh = data?.data ?? [];
      setRows((prev) =>
        cohortId && prev ? prev.map((r) => fresh.find((f) => f.cohort_id === r.cohort_id) ?? r) : fresh,
      );
      // After adding, read again so the preview reflects what is now there.
      if (addRemaining) {
        const again = await invokeAdmin<{ data?: Result[] }>({
          action: "sync_cohort_sessions",
          ...(cohortId ? { cohort_id: cohortId } : {}),
        });
        const reread = again.data?.data ?? [];
        setRows((prev) =>
          (prev ?? []).map((x) => {
            const r = reread.find((y) => y.cohort_id === x.cohort_id);
            const made = fresh.find((y) => y.cohort_id === x.cohort_id)?.created ?? [];
            return r ? { ...r, created: made } : x;
          }),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sincronizarea a eșuat.");
      setRows((r) => r ?? []);
    } finally {
      setBusy(null);
    }
  }, []);

  useEffect(() => {
    void sync();
  }, [sync]);

  return (
    <section className="space-y-4 rounded-[20px] border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Lecțiile grupelor</h2>
          <p className="text-sm text-muted-foreground">
            Citite din Google Calendar (titluri ca „…-L12”). O lecție mutată sau scoasă acolo (o pauză) se schimbă și aici
            la următoarea sincronizare.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void sync()}
            disabled={!!busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-semibold hover:bg-muted"
          >
            {busy === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sincronizează toate
          </button>
          {(rows ?? []).filter((r) => r.plan.length > 0).length > 1 && (
            <button
              type="button"
              onClick={() => setConfirm("all")}
              disabled={!!busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-green px-4 font-semibold text-white hover:opacity-90"
            >
              <CalendarPlus className="h-4 w-4" /> Adaugă la toate
            </button>
          )}
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      {!rows && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se citește calendarul…
        </p>
      )}
      {rows && rows.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Nicio grupă în desfășurare legată de calendar.</p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {rows?.map((r) => {
          const done = r.last_lesson?.number ?? 0;
          const total = r.total_lessons ?? 0;
          const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
          return (
            <article key={r.cohort_id} className="flex flex-col gap-3 rounded-2xl border border-border/80 p-4">
              <div>
                <h3 className="font-semibold">{r.calendar_title}</h3>
                <p className="text-sm text-muted-foreground">
                  {r.found} {r.found === 1 ? "lecție găsită" : "lecții găsite"} în calendar
                </p>
              </div>
              {total > 0 && (
                <div className="space-y-1.5">
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand-green" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-sm">
                    Ultima din calendar: <b>Lecția {done}</b> din {total}
                    {r.last_lesson ? ` · ${fmtWhen(r.last_lesson.starts_at)}` : ""}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => void sync(r.cohort_id)}
                disabled={!!busy}
                className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-border px-3 text-sm font-semibold hover:bg-muted"
              >
                {busy === r.cohort_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sincronizează doar grupa asta
              </button>
              {r.missing_meetings && (
                <p className="text-sm text-admin-warn-fg">Grupa nu are zilele și orele setate, așa că nu pot plănui restul.</p>
              )}
              {r.created.length > 0 && (
                <p className="rounded-xl bg-accent px-3 py-2 text-sm">
                  Adăugate în calendar: lecțiile {r.created[0]}–{r.created[r.created.length - 1]}.
                </p>
              )}
              {r.plan.length > 0 ? (
                <>
                  <p className="text-sm">
                    Mai lipsesc <b>{r.plan.length}</b> lecții, până la Lecția {total}:
                  </p>
                  <ul className="max-h-40 overflow-y-auto rounded-xl bg-muted/60 px-3 py-2 text-sm tabular-nums">
                    {r.plan.map((p) => (
                      <li key={p.lesson_number} className="flex justify-between gap-2 py-0.5">
                        <span>Lecția {p.lesson_number}</span>
                        <span className="text-muted-foreground">
                          {fmtDay(p.date)} · {p.start_time}–{p.end_time}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => {
                      setExtra("");
                      setConfirm(r);
                    }}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green px-4 font-semibold text-white hover:opacity-90",
                    )}
                  >
                    {busy === r.cohort_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
                    Adaugă-le în Google Calendar
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {r.guests?.length
                      ? `Invitați: ${r.guests.length} (din ultima lecție), plus cine adaugi tu.`
                      : "Ultima lecție nu are invitați; poți adăuga emailuri la pasul următor."}
                  </p>
                </>
              ) : (
                total > 0 &&
                done >= total && <p className="text-sm text-muted-foreground">Toate lecțiile sunt în calendar.</p>
              )}
            </article>
          );
        })}
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent className="admin-theme">
          {confirm === "all" ? (
            <AlertDialogHeader>
              <AlertDialogTitle>Adaugi lecțiile lipsă la toate grupele?</AlertDialogTitle>
              <AlertDialogDescription>
                {(rows ?? [])
                  .filter((r) => r.plan.length)
                  .map((r) => `${r.calendar_title}: ${r.plan.length}`)
                  .join(" · ")}
                . Fiecare lecție are aceleași zile și ore ca grupa, același loc și link ca ultima lecție, iar invitații ultimei
                lecții primesc invitația obișnuită de la Google.
              </AlertDialogDescription>
            </AlertDialogHeader>
          ) : (
            confirm && (
              <AlertDialogHeader>
                <AlertDialogTitle>Adaugi {confirm.plan.length} lecții în calendar?</AlertDialogTitle>
                <AlertDialogDescription>
                  {confirm.calendar_title}, lecțiile {confirm.plan[0]?.lesson_number}–
                  {confirm.plan[confirm.plan.length - 1]?.lesson_number}, în zilele și orele grupei, cu același loc și același
                  link ca ultima lecție. {confirm.guests?.length ? `Primesc invitație cei ${confirm.guests.length} invitați ai ultimei lecții` : "Ultima lecție nu are invitați"}
                  {" "}și cine scrii mai jos. Le poți muta sau șterge oricând din Google Calendar.
                </AlertDialogDescription>
                <label className="mt-2 flex flex-col gap-1.5 text-sm font-semibold">
                  Invitați în plus (un cursant nou), câte un email pe rând
                  <textarea
                    rows={2}
                    value={extra}
                    onChange={(e) => setExtra(e.target.value)}
                    placeholder="nume@exemplu.ro"
                    className="rounded-xl border border-input bg-background px-3 py-2 text-sm font-normal"
                  />
                </label>
              </AlertDialogHeader>
            )
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const c = confirm;
                setConfirm(null);
                const emails = extra
                  .split(/[\s,;]+/)
                  .map((e) => e.replace(/^mailto:/i, "").trim())
                  .filter(Boolean);
                if (c === "all") void sync(undefined, true);
                else if (c) void sync(c.cohort_id, true, emails);
              }}
            >
              Adaugă
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default CohortSessionsAdmin;
