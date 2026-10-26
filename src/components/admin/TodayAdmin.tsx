import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  RefreshCw,
  Video,
} from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formTypeLabels, paymentStatusLabels, meetingLabel } from "./types";
import { Empty, ErrorNote, Loading } from "./ui";
import { TrialOutcomeControl } from "@/components/admin/TrialOutcome";
import LessonEditDialog from "./LessonEditDialog";
import { PackageLessonBadge } from "./LessonOutcome";

/**
 * The screen the panel opens on.
 *
 * It used to be four all-time totals and two all-time funnels. Nobody opens an
 * admin panel to find out how many registrations there have ever been, and
 * since the Analiză tab exists that was also a second, worse answer to a
 * question it handles properly.
 *
 * So this is a worklist: lessons about to happen, people nobody has replied to,
 * people who said yes and never paid, groups about to start, and anything the
 * system itself is unhappy about. Every row goes somewhere you can act.
 *
 * When all five are empty it says so and stops. An empty worklist is a good
 * morning, and the screen should look like one rather than like a page that
 * failed to load.
 */

interface Lesson {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  notes?: string | null;
  event_type_slug: string;
  format: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  meet_link: string | null;
  google_event_id?: string | null;
  google_sync_error: string | null;
  manage_token: string;
  lesson_number?: number | null;
  package_total?: number | null;
}
interface Lead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  form_type: string;
  level: string | null;
  format: string | null;
  payment_status?: string;
  waitingDays: number;
}
interface Cohort {
  id: string;
  title_ro: string | null;
  title_en: string | null;
  level: string | null;
  format: string | null;
  start_date: string;
  status: string;
  teaching_language: string | null;
}
interface Problem {
  kind: string;
  id: string;
  detail: string;
}
interface Today {
  now: string;
  lessons: Lesson[];
  uncontacted: Lead[];
  unpaid: Lead[];
  cohortsStartingSoon: Cohort[];
  problems: Problem[];
  /** Past lessons that never reached the calendar — a backlog, not work. */
  olderUnsyncedLessons?: number;
  /** Free trials that ended in the last 24h with no outcome yet; after 24h they count as done. */
  trialsToMark?: Array<{
    id: string;
    start_at: string;
    end_at: string;
    student_name: string;
    student_email: string;
    student_phone: string | null;
    format: string;
    trial_outcome: null;
  }>;
  /** Private packages with one lesson left (or none) for a student still coming. */
  lowPackages?: Array<{
    id: string;
    name: string | null;
    phone: string | null;
    quantity: number;
    used: number;
    left: number;
    next_lesson_at: string | null;
  }>;
  /** Lessons still booked for a registration whose payment was fully refunded; the owner decides whether to cancel. */
  refundedLessons?: Array<{
    id: string;
    registration_id: string;
    start_at: string;
    end_at: string;
    student_name: string;
    student_email: string;
    format: string;
  }>;
}

const TZ = "Europe/Bucharest";
const timeFmt = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
});
const dayFmt = new Intl.DateTimeFormat("ro-RO", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "azi" / "mâine" where that is clearer than the date. */
const dayLabel = (iso: string, now: string) => {
  const key = (d: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(d));
  const today = key(now);
  const tomorrow = key(new Date(Date.parse(now) + 86_400_000).toISOString());
  const k = key(iso);
  if (k === today) return "Azi";
  if (k === tomorrow) return "Mâine";
  return dayFmt.format(new Date(iso));
};

const waitLabel = (d: number) =>
  d === 0 ? "azi" : d === 1 ? "de ieri" : `de ${d} zile`;

const COHORT_STATUS: Record<string, string> = {
  draft: "Draft",
  forming: "În formare",
  minimum_reached: "Minim atins",
  confirmed: "Confirmată",
  full: "Plină",
  in_progress: "În desfășurare",
  completed: "Încheiată",
  cancelled: "Anulată",
};

type Filter = "all" | "uncontacted" | "unpaid" | "problems";

/** What Acasă tells the rest of the panel once it has loaded. */
export interface TodaySummary {
  /** false when a lesson in the next days, or an older one, is not in Google Calendar. */
  calendarOk: boolean;
  /** People waiting on the owner: nobody replied, or said yes and did not pay. */
  peopleToDo: number;
}

interface Props {
  onGoToLeads?: () => void;
  onOpenPerson?: (id: string) => void;
  onGo?: (tab: string) => void;
  /** Registrations in the last seven days (not counting abandoned trial forms). */
  newLast7?: { total: number; trials: number };
  onLoaded?: (s: TodaySummary) => void;
}

const card = "rounded-[20px] border border-border bg-card";
const rowBtn =
  "inline-flex min-h-10 items-center rounded-[10px] px-3.5 text-sm font-semibold transition-colors";

/**
 * Acasă (October 2026 redesign; was "Azi").
 *
 * Still a worklist and not a report: the same five lists from list_today, now
 * read in one glance. Four numbers on top, then one "De rezolvat" list that
 * merges problems, people nobody has answered and people who have not paid,
 * oldest first, with a filter for each. Beside it, the lessons of today and
 * tomorrow and the groups about to start. Every row leads somewhere you can act.
 */
const TodayAdmin = ({
  onGoToLeads,
  onOpenPerson,
  onGo,
  newLast7,
  onLoaded,
}: Props) => {
  const [data, setData] = useState<Today | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyRow, setBusyRow] = useState<string | null>(null);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [rowError, setRowError] = useState<{
    id: string;
    message: string;
  } | null>(null);

  // One click from the worklist: a lead nobody answered gets its status (and
  // leaves the list, because only "new" leads are listed); someone who said
  // yes and has not paid can be put aside for 7 days after the owner talked to
  // them. Both are saved before the row disappears.
  const act = async (
    id: string,
    list: "uncontacted" | "unpaid",
    body: Record<string, unknown>,
  ) => {
    setBusyRow(id);
    setRowError(null);
    try {
      const { data: res, error: err } = await invokeAdmin<{
        error?: string;
        success?: boolean;
        data?: unknown;
      }>({ ...body, id });
      if (err || res?.error)
        throw new Error(res?.error || err?.message || "Nu s-a salvat.");
      setData((d) =>
        d ? { ...d, [list]: d[list].filter((r) => r.id !== id) } : d,
      );
    } catch (e) {
      setRowError({
        id,
        message: e instanceof Error ? e.message : "Nu s-a salvat.",
      });
    } finally {
      setBusyRow(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: res, error: err } = await invokeAdmin({
        action: "list_today",
      });
      if (err) throw err;
      if (res?.error) throw new Error(res.error);
      setData(res?.data ?? null);
    } catch (e) {
      console.error("[today] load failed", e);
      setError("Lista de azi nu a putut fi încărcată.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data) return;
    onLoaded?.({
      calendarOk:
        !data.problems.some((p) => p.kind === "calendar") &&
        !data.olderUnsyncedLessons,
      peopleToDo: data.uncontacted.length + data.unpaid.length,
    });
  }, [data, onLoaded]);

  const nothingToDo =
    data &&
    data.lessons.length === 0 &&
    data.uncontacted.length === 0 &&
    data.unpaid.length === 0 &&
    data.cohortsStartingSoon.length === 0 &&
    data.problems.length === 0 &&
    !data.olderUnsyncedLessons;

  const todo = useMemo(() => {
    if (!data) return [];
    const problems = data.problems.map((p) => ({
      type: "problems" as const,
      key: `p-${p.kind}-${p.id}`,
      p,
    }));
    const people = [
      ...data.uncontacted.map((r) => ({
        type: "uncontacted" as const,
        key: `u-${r.id}`,
        r,
      })),
      ...data.unpaid.map((r) => ({
        type: "unpaid" as const,
        key: `n-${r.id}`,
        r,
      })),
    ].sort((a, b) => b.r.waitingDays - a.r.waitingDays);
    return [...problems, ...people];
  }, [data]);

  const shown = filter === "all" ? todo : todo.filter((t) => t.type === filter);
  const counts = {
    all: todo.length,
    uncontacted: data?.uncontacted.length ?? 0,
    unpaid: data?.unpaid.length ?? 0,
    problems: data?.problems.length ?? 0,
  };

  const lessonsByDay = useMemo(() => {
    const groups: { day: string; lessons: Lesson[] }[] = [];
    for (const l of data?.lessons ?? []) {
      const day = dayLabel(l.start_at, data!.now);
      const g = groups.find((x) => x.day === day);
      if (g) g.lessons.push(l);
      else groups.push({ day, lessons: [l] });
    }
    return groups;
  }, [data]);

  const todayLessons = lessonsByDay.find((g) => g.day === "Azi")?.lessons ?? [];
  const nextToday = todayLessons.find(
    (l) => Date.parse(l.start_at) > Date.now(),
  );
  const urgent = counts.problems + (data?.olderUnsyncedLessons ? 1 : 0);

  const tile =
    "flex min-h-[124px] flex-col gap-1.5 rounded-2xl p-5 text-left transition-colors";

  return (
    <div className="space-y-7">
      {error && <ErrorNote>{error}</ErrorNote>}
      {loading && !data && <Loading label="Se încarcă…" />}

      {data && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(tile, "bg-brand-green text-white hover:opacity-95")}
          >
            <span className="text-[0.8125rem] text-white/80">De rezolvat</span>
            <span className="font-display text-[2.125rem] font-semibold leading-none">
              {counts.all}
            </span>
            <span className="text-[0.8125rem] text-white/80">
              {urgent
                ? `${urgent} ${urgent === 1 ? "problemă" : "probleme"}`
                : "nicio problemă"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onGo?.("week")}
            className={cn(
              tile,
              "border border-border bg-card hover:border-brand-green/50",
            )}
          >
            <span className="text-[0.8125rem] text-muted-foreground">
              Lecții azi
            </span>
            <span className="font-display text-[2.125rem] font-semibold leading-none">
              {todayLessons.length}
            </span>
            <span className="text-[0.8125rem] text-muted-foreground">
              {nextToday
                ? `următoarea la ${timeFmt.format(new Date(nextToday.start_at))}`
                : "niciuna de acum încolo"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onGoToLeads?.()}
            className={cn(
              tile,
              "border border-border bg-card hover:border-brand-green/50",
            )}
          >
            <span className="text-[0.8125rem] text-muted-foreground">
              Înscrieri noi, 7 zile
            </span>
            <span className="font-display text-[2.125rem] font-semibold leading-none">
              {newLast7?.total ?? "—"}
            </span>
            <span className="text-[0.8125rem] text-muted-foreground">
              {newLast7
                ? `${newLast7.trials} ${newLast7.trials === 1 ? "lecție de probă" : "lecții de probă"}`
                : ""}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onGo?.("cohorts")}
            className={cn(
              tile,
              "border border-border bg-card hover:border-brand-green/50",
            )}
          >
            <span className="text-[0.8125rem] text-muted-foreground">
              Grupe care încep
            </span>
            <span className="font-display text-[2.125rem] font-semibold leading-none">
              {data.cohortsStartingSoon.length}
            </span>
            <span className="text-[0.8125rem] text-muted-foreground">
              în următoarele 14 zile
            </span>
          </button>
        </div>
      )}

      {nothingToDo && (
        <Empty
          icon={CheckCircle2}
          title="Nimic de rezolvat acum."
          description="Nicio lecție în următoarele două zile, niciun lead necontactat, nicio plată în așteptare."
        />
      )}

      {data && !nothingToDo && (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <section className={cn(card, "flex flex-col gap-4 p-5 sm:p-6")}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold">
                De rezolvat
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[0.8125rem] text-muted-foreground">
                  Cei care așteaptă de mai mult, primii
                </span>
                <button
                  type="button"
                  aria-label="Reîncarcă"
                  onClick={() => void load()}
                  disabled={loading}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
              {(
                [
                  ["all", "Toate"],
                  ["uncontacted", "Nu le-a răspuns nimeni"],
                  ["unpaid", "Au spus da, n-au plătit"],
                  ["problems", "Ce nu merge"],
                ] as [Filter, string][]
              ).map(([f, label]) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "min-h-10 shrink-0 rounded-full border px-3.5 text-sm transition-colors",
                    filter === f
                      ? "border-brand-green bg-brand-green font-semibold text-white"
                      : "border-border bg-card hover:border-brand-green/50",
                  )}
                >
                  {label} · {counts[f]}
                </button>
              ))}
            </div>

            {!!data.trialsToMark?.length && filter === "all" && (
              <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">
                  Probe gratuite de ieri: a venit?
                </p>
                <p className="text-xs text-muted-foreground">
                  Dacă nu marchezi nimic, după 24 de ore proba se consideră
                  făcută.
                </p>
                {data.trialsToMark.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-border p-3"
                  >
                    <p className="text-sm font-medium">
                      {t.student_name} · {timeFmt.format(new Date(t.start_at))}
                    </p>
                    <TrialOutcomeControl
                      booking={{ ...t, status: "confirmed" }}
                      onChanged={() =>
                        setData((d) =>
                          d
                            ? {
                                ...d,
                                trialsToMark: (d.trialsToMark ?? []).filter(
                                  (x) => x.id !== t.id,
                                ),
                              }
                            : d,
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {!!data.lowPackages?.length && filter === "all" && (
              <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">
                  Pachete aproape terminate
                </p>
                <ul className="space-y-1 text-sm">
                  {data.lowPackages.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span className="min-w-0 flex-1">
                        <b>{p.name || "Fără nume"}</b> ·{" "}
                        {p.left === 1
                          ? `mai are 1 lecție din ${p.quantity}`
                          : `a folosit toate cele ${p.quantity} lecții`}
                        {p.next_lesson_at &&
                          ` · următoarea: ${new Intl.DateTimeFormat("ro-RO", {
                            timeZone: TZ,
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(new Date(p.next_lesson_at))}`}
                      </span>
                      <button
                        type="button"
                        className={cn(rowBtn, "border border-border")}
                        onClick={() => onOpenPerson?.(p.id)}
                      >
                        Fișa
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!!data.refundedLessons?.length &&
              (filter === "all" || filter === "problems") && (
                <div className="space-y-2 rounded-2xl border border-admin-warn-line bg-admin-warn-bg p-4 text-admin-warn-fg">
                  <p className="text-sm font-semibold">
                    Plată rambursată, dar lecția e încă programată
                  </p>
                  <p className="text-xs">
                    Banii au fost returnați. Dacă lecția nu mai are loc,
                    anuleaz-o din Toate lecțiile; nu se anulează automat.
                  </p>
                  <ul className="space-y-1 text-sm">
                    {data.refundedLessons.map((b) => (
                      <li key={b.id}>
                        {b.student_name} ·{" "}
                        {new Intl.DateTimeFormat("ro-RO", {
                          timeZone: TZ,
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(b.start_at))}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {!!data.olderUnsyncedLessons &&
              (filter === "all" || filter === "problems") && (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-admin-warn-line bg-admin-warn-bg p-4 text-admin-warn-fg">
                  <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
                  <p className="min-w-[200px] flex-1 text-sm">
                    {data.olderUnsyncedLessons === 1
                      ? "O lecție deja trecută nu a ajuns niciodată în Google Calendar."
                      : `${data.olderUnsyncedLessons} lecții deja trecute nu au ajuns niciodată în Google Calendar.`}{" "}
                    Înseamnă că sincronizarea a căzut, nu că a fost ghinion.
                  </p>
                  <button
                    type="button"
                    onClick={() => onGo?.("calendar-health")}
                    className={cn(
                      rowBtn,
                      "border border-admin-warn-line bg-card text-foreground",
                    )}
                  >
                    Sănătate calendar
                  </button>
                </div>
              )}

            {shown.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nimic aici.</p>
            ) : (
              <ul className="flex flex-col">
                {shown.map((t) => {
                  if (t.type === "problems") {
                    const calendar = t.p.kind === "calendar";
                    return (
                      <li
                        key={t.key}
                        className="flex flex-wrap items-center gap-3.5 border-t border-border/70 py-3.5"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-admin-warn-bg text-admin-warn-fg">
                          <AlertTriangle className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="min-w-[180px] flex-1">
                          <p className="font-semibold">
                            {calendar
                              ? "Lecție care nu e în Google Calendar"
                              : "Plată cu probleme"}
                          </p>
                          <p className="text-[0.8125rem] text-muted-foreground">
                            {t.p.detail}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            calendar
                              ? onGo?.("calendar-health")
                              : onOpenPerson?.(t.p.id)
                          }
                          className={cn(
                            rowBtn,
                            "border border-border hover:border-brand-green/60",
                          )}
                        >
                          {calendar ? "Sănătate calendar" : "Deschide"}
                        </button>
                      </li>
                    );
                  }
                  const r = t.r;
                  const unpaid = t.type === "unpaid";
                  return (
                    <li
                      key={t.key}
                      className="flex flex-wrap items-center gap-3.5 border-t border-border/70 py-3.5"
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          unpaid
                            ? "bg-admin-info-bg text-admin-info-fg"
                            : "bg-accent text-brand-green dark:text-primary",
                        )}
                      >
                        {unpaid ? (
                          <CreditCard className="h-5 w-5" aria-hidden />
                        ) : (
                          <MessageCircle className="h-5 w-5" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-[180px] flex-1">
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-[0.8125rem] text-muted-foreground">
                          {formTypeLabels[r.form_type] ?? r.form_type}
                          {r.level ? ` · ${r.level}` : ""}
                          {unpaid
                            ? ` · ${paymentStatusLabels[r.payment_status ?? ""] ?? r.payment_status ?? "neplătit"} ${waitLabel(r.waitingDays)}`
                            : ` · nu i-a răspuns nimeni ${waitLabel(r.waitingDays)}`}
                        </p>
                      </div>
                      {!unpaid && (
                        <div
                          className="flex flex-wrap gap-1.5"
                          role="group"
                          aria-label={`Marchează ${r.name}`}
                        >
                          {(
                            [
                              ["contacted", "Contactat"],
                              ["no_response", "Fără răspuns"],
                              ["not_suitable", "Nepotrivit"],
                            ] as const
                          ).map(([status, label]) => (
                            <button
                              key={status}
                              type="button"
                              disabled={busyRow === r.id}
                              onClick={() =>
                                void act(r.id, "uncontacted", {
                                  action: "update_status",
                                  lead_status: status,
                                })
                              }
                              className={cn(
                                rowBtn,
                                "border border-border hover:border-brand-green/60 disabled:opacity-50",
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                      {unpaid &&
                        (["cash", "transfer"] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            disabled={busyRow === r.id}
                            onClick={() => {
                              const how =
                                method === "cash"
                                  ? "cash"
                                  : "prin transfer bancar";
                              if (
                                window.confirm(
                                  `Marchezi ${r.name} ca plătit ${how}? Folosește doar dacă banii au ajuns la tine.`,
                                )
                              ) {
                                void act(r.id, "unpaid", {
                                  action: "mark_paid_offline",
                                  method,
                                });
                              }
                            }}
                            className={cn(
                              rowBtn,
                              "border border-border hover:border-brand-green/60 disabled:opacity-50",
                            )}
                          >
                            {method === "cash"
                              ? "Plătit cash"
                              : "Plătit prin transfer"}
                          </button>
                        ))}
                      {unpaid && (
                        <button
                          type="button"
                          disabled={busyRow === r.id}
                          onClick={() =>
                            void act(r.id, "unpaid", {
                              action: "snooze_followup",
                              days: 7,
                            })
                          }
                          title="Dispare din listă 7 zile; revine dacă tot nu a plătit"
                          className={cn(
                            rowBtn,
                            "border border-border hover:border-brand-green/60 disabled:opacity-50",
                          )}
                        >
                          Am vorbit cu el · 7 zile
                        </button>
                      )}
                      {unpaid && (
                        <button
                          type="button"
                          disabled={busyRow === r.id}
                          onClick={() =>
                            void act(r.id, "unpaid", {
                              action: "update_status",
                              lead_status: "no_response",
                            })
                          }
                          title="Marchează „Fără răspuns” și scoate-l din listă. Înscrierea rămâne; dacă revine, cererea nouă apare separat."
                          className={cn(
                            rowBtn,
                            "border border-border hover:border-brand-green/60 disabled:opacity-50",
                          )}
                        >
                          Nu mai răspunde
                        </button>
                      )}
                      {unpaid && r.payment_status === "unpaid" && (
                        <button
                          type="button"
                          disabled={busyRow === r.id}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Marchezi lecția lui ${r.name} ca gratuită (de ex. recuperare)? Nu va mai apărea ca neplătită.`,
                              )
                            ) {
                              void act(r.id, "unpaid", { action: "mark_free" });
                            }
                          }}
                          title="Lecție dată gratuit (recuperare): nu datorează nimic"
                          className={cn(
                            rowBtn,
                            "border border-border hover:border-brand-green/60 disabled:opacity-50",
                          )}
                        >
                          Gratuit
                        </button>
                      )}
                      {rowError?.id === r.id && (
                        <p
                          role="alert"
                          className="w-full text-xs text-destructive"
                        >
                          {rowError.message}
                        </p>
                      )}
                      {!unpaid && r.phone && (
                        <a
                          href={buildWhatsAppUrl(r.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            rowBtn,
                            "bg-brand-green text-white hover:opacity-90",
                          )}
                        >
                          WhatsApp
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenPerson?.(r.id)}
                        className={cn(
                          rowBtn,
                          "text-brand-green hover:bg-muted dark:text-primary",
                        )}
                      >
                        Deschide
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {onGoToLeads && (
              <button
                type="button"
                onClick={onGoToLeads}
                className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-brand-green hover:underline dark:text-primary"
              >
                Vezi toate înscrierile{" "}
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
              </button>
            )}
          </section>

          <div className="flex flex-col gap-5">
            <section className={cn(card, "flex flex-col gap-3.5 p-5 sm:p-6")}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold">
                  Lecții, azi și mâine
                </h2>
                <button
                  type="button"
                  onClick={() => onGo?.("week")}
                  className="min-h-11 text-sm font-semibold text-brand-green hover:underline dark:text-primary"
                >
                  Program
                </button>
              </div>
              {lessonsByDay.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nicio lecție rezervată în următoarele două zile.
                </p>
              )}
              {lessonsByDay.map((g) => (
                <div key={g.day} className="flex flex-col gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {g.day}
                  </span>
                  {g.lessons.map((l) => {
                    const missing = !l.google_event_id;
                    const next = l.id === nextToday?.id;
                    return (
                      <div
                        key={l.id}
                        className={cn(
                          "flex items-center gap-3.5 rounded-[14px] px-3.5 py-3",
                          missing
                            ? "border border-dashed border-admin-warn-line bg-admin-warn-bg"
                            : next
                              ? "bg-accent"
                              : "border border-border/70",
                        )}
                      >
                        <span className="w-14 shrink-0 font-bold tabular-nums">
                          {timeFmt.format(new Date(l.start_at))}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {l.student_name}
                            <PackageLessonBadge lesson={l} />
                            {(l.event_type_slug === "trial" ||
                              l.event_type_slug === "verificare-nivel") && (
                              <span className="ml-1.5 rounded-md bg-card px-1.5 py-0.5 text-xs font-semibold text-brand-green dark:text-primary">
                                {l.event_type_slug === "trial"
                                  ? "probă"
                                  : "verificare nivel"}
                              </span>
                            )}
                          </p>
                          <p
                            className={cn(
                              "flex items-center gap-1 text-[0.8125rem]",
                              missing
                                ? "text-admin-warn-fg"
                                : "text-muted-foreground",
                            )}
                          >
                            {l.format === "online" ? (
                              <Video className="h-3.5 w-3.5" aria-hidden />
                            ) : (
                              <MapPin className="h-3.5 w-3.5" aria-hidden />
                            )}
                            {l.format === "online" ? "online" : "la centru"}
                            {missing ? " · nu e în Google Calendar" : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditing(l)}
                          aria-label={`Modifică lecția cu ${l.student_name}`}
                          className={cn(
                            rowBtn,
                            "border border-border hover:border-brand-green/60",
                          )}
                        >
                          Modifică
                        </button>
                        {l.meet_link && (
                          <a
                            href={l.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              rowBtn,
                              next
                                ? "bg-brand-green text-white hover:opacity-90"
                                : "border border-border hover:border-brand-green/60",
                            )}
                          >
                            {meetingLabel(l.meet_link)}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </section>

            <section className={cn(card, "flex flex-col gap-3 p-5 sm:p-6")}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold">
                  Grupe care încep curând
                </h2>
                <button
                  type="button"
                  onClick={() => onGo?.("cohorts")}
                  className="min-h-11 text-sm font-semibold text-brand-green hover:underline dark:text-primary"
                >
                  Grupe
                </button>
              </div>
              {data.cohortsStartingSoon.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nicio grupă nu începe în următoarele 14 zile.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {data.cohortsStartingSoon.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/70 py-3 first:border-0"
                    >
                      <span className="min-w-0 flex-1 font-semibold">
                        {c.title_ro || c.title_en || c.level || "Grupă"}
                      </span>
                      <span className="text-[0.8125rem] text-muted-foreground">
                        de pe{" "}
                        {new Date(
                          `${c.start_date}T12:00:00Z`,
                        ).toLocaleDateString("ro-RO", {
                          day: "numeric",
                          month: "short",
                          timeZone: "UTC",
                        })}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                        {COHORT_STATUS[c.status] ?? c.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-[0.8125rem] text-muted-foreground">
                Locurile ocupate se văd în Grupe — acolo se calculează, inclusiv
                ajustarea manuală.
              </p>
            </section>
          </div>
        </div>
      )}
      <LessonEditDialog
        lesson={editing}
        onClose={() => setEditing(null)}
        onChanged={() => void load()}
      />
    </div>
  );
};

export default TodayAdmin;
