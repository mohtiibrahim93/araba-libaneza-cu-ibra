import { supabase } from "@/integrations/supabase/client";
import { groupPagePath } from "@/lib/groupPage";
import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { BUCHAREST_TZ } from "@/lib/timezone";
import { Button } from "@/components/ui/button";
import { minGroupSize } from "@/lib/groupSize";
import type { CourseSummary } from "./CourseOverviewAdmin";
import {
  cohortAdminTitle,
  cohortStatusLabels,
  courseDate,
} from "./RegistrationCourse";
import { paymentStatusLabels } from "./types";

/**
 * Grupe › Grupe în formare (owner, 30 Oct 2026).
 *
 * The first card of the tab: every group that has not started yet, with its
 * places and registrations. "Lecțiile grupelor" below lists only groups with
 * lessons in the calendar, so a group still forming was invisible there.
 * Same data as "Grupe — înscrieri și locuri" (admin-registrations:
 * course_overview); no server change.
 */

/** Statuses of a group that has not started. Drafts are shown so they get fixed. */
const NOT_STARTED = new Set([
  "draft",
  "forming",
  "minimum_reached",
  "confirmed",
  "full",
]);

/** Each payment status keeps its own count (AGENTS.md: distinct states). */
const PAYMENT_ORDER = [
  "paid",
  "free",
  "pending",
  "card_saved",
  "unpaid",
  "failed",
  "expired",
  "past_due",
  "refunded",
  "unspecified",
];

function todayInBucharest(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BUCHAREST_TZ }).format(
    new Date(),
  );
}

/** Whole days from today (Bucharest) to the start date; negative if past. */
export function daysUntil(startDate: string, today: string): number {
  const ms =
    Date.parse(`${startDate.slice(0, 10)}T00:00:00Z`) -
    Date.parse(`${today}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function formingCohorts(
  rows: CourseSummary[],
  today: string,
): CourseSummary[] {
  return rows
    .filter(
      (c) =>
        NOT_STARTED.has(c.status) &&
        (c.status === "draft" ||
          !c.start_date ||
          c.start_date.slice(0, 10) >= today),
    )
    .sort(
      (a, b) =>
        (a.start_date ?? "9999").localeCompare(b.start_date ?? "9999") ||
        a.id.localeCompare(b.id),
    );
}

function startLine(c: CourseSummary, today: string) {
  if (!c.start_date) return "Fără dată de start";
  const days = daysUntil(c.start_date, today);
  const when =
    days > 1
      ? `peste ${days} ${days < 20 ? "zile" : "de zile"}`
      : days === 1
        ? "mâine"
        : days === 0
          ? "azi"
          : "data a trecut: setează una nouă sau anulează grupa";
  return `Start ${courseDate(c.start_date)} · ${when}`;
}

export default function FormingCohortsAdmin({
  onShowRegistrations,
}: { onShowRegistrations?: (id: string, name: string) => void } = {}) {
  const [rows, setRows] = useState<CourseSummary[]>([]);
  // Each group's public address (its stored slug), for "Pagina publică".
  const [slugs, setSlugs] = useState<Record<string, string>>({});
  useEffect(() => {
    // Best effort: without slugs the card simply has no "Pagina publică".
    if (typeof supabase.from !== "function") return;
    type SlugRow = { id: string; slug: string | null };
    const table = supabase.from("group_cohorts") as unknown as {
      select: (c: string) => PromiseLike<{ data: SlugRow[] | null }>;
    };
    void Promise.resolve(table.select("id, slug"))
      .then(({ data }) =>
        setSlugs(
          Object.fromEntries(
            (data ?? [])
              .filter((r) => r.slug)
              .map((r) => [r.id, r.slug as string]),
          ),
        ),
      )
      .catch(() => undefined);
  }, []);
  // "Editează grupa": the group's row in the editor further down this tab.
  const editGroup = (id: string) => {
    const row = document.getElementById(`cohort-row-${id}`);
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "start" });
    row.classList.add("ring-2", "ring-primary");
    window.setTimeout(
      () => row.classList.remove("ring-2", "ring-primary"),
      2500,
    );
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: failure } = await invokeAdmin({
        action: "course_overview",
      });
      if (failure || data?.error || !Array.isArray(data?.data))
        throw new Error("Cannot load groups");
      setRows(
        data.data.filter((c: CourseSummary) => c.course_type !== "privat"),
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const today = todayInBucharest();
  const visible = formingCohorts(rows, today);

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Grupe în formare</h2>
          <p className="text-sm text-muted-foreground">
            Grupele care n-au început încă, cu locurile și înscrierile lor.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => void load()}
        >
          Actualizează
        </Button>
      </div>
      {loading ? (
        <p>Se încarcă…</p>
      ) : error ? (
        <div role="alert" className="space-y-2">
          <p>Nu am putut încărca grupele.</p>
          <Button onClick={() => void load()}>Reîncearcă</Button>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm">Nicio grupă în formare.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((c) => {
            const title = cohortAdminTitle(c);
            const min = minGroupSize(c.max_seats);
            const taken = c.taken;
            const missing = taken === null ? null : Math.max(0, min - taken);
            const registered = c.registration_count - c.incomplete_count;
            const payments = PAYMENT_ORDER.filter(
              (s) => (c.payments[s] ?? 0) > 0,
            ).concat(
              Object.keys(c.payments).filter(
                (s) => !PAYMENT_ORDER.includes(s) && (c.payments[s] ?? 0) > 0,
              ),
            );
            const pct =
              taken === null || c.max_seats <= 0
                ? 0
                : Math.min(100, Math.round((taken / c.max_seats) * 100));
            return (
              <article
                key={c.id}
                className={`space-y-3 rounded-lg border p-4 ${
                  c.status === "draft"
                    ? "border-dashed border-border"
                    : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{title}</h3>
                    {c.schedule_label_ro && (
                      <p className="text-sm text-muted-foreground">
                        {c.schedule_label_ro}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                    {cohortStatusLabels[c.status] ?? c.status}
                  </span>
                </div>
                <p className="text-sm font-medium">{startLine(c, today)}</p>
                {c.status === "draft" ? (
                  <p className="text-sm text-muted-foreground">
                    Ciornă: nu apare pe site.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span>
                        <strong>
                          {taken ?? "?"} / {c.max_seats}
                        </strong>{" "}
                        locuri ocupate
                      </span>
                      <span>
                        {missing === null
                          ? `Minim ${min}`
                          : missing === 0
                            ? `Minim ${min} atins`
                            : `Mai ${missing === 1 ? "lipsește 1" : `lipsesc ${missing}`} până la minim (${min})`}
                      </span>
                    </div>
                    <div
                      className="relative h-2.5 rounded-full bg-muted"
                      role="img"
                      aria-label={`${taken ?? 0} din ${c.max_seats} locuri ocupate, minim ${min}`}
                    >
                      <div
                        className="h-2.5 rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="absolute -top-[3px] h-4 w-0.5 bg-foreground"
                        style={{ left: `${(min / c.max_seats) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-md bg-muted/60 px-2 py-1">
                    <strong>{registered}</strong> înscrieri
                    {c.incomplete_count > 0
                      ? ` (+${c.incomplete_count} incomplete)`
                      : ""}
                  </span>
                  {c.form_type === "group" && c.month_status ? (
                    <>
                      <span className="rounded-md bg-emerald-500/10 px-2 py-1">
                        <strong>{c.month_status.up_to_date}</strong> plătit la
                        zi
                      </span>
                      <span className="rounded-md bg-red-500/10 px-2 py-1">
                        <strong>{c.month_status.unpaid}</strong> neplătit
                      </span>
                    </>
                  ) : null}
                  {payments
                    .filter(
                      (s) =>
                        !(c.form_type === "group" && c.month_status) ||
                        s === "refunded",
                    )
                    .map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-muted/60 px-2 py-1"
                      >
                        <strong>{c.payments[s]}</strong>{" "}
                        {(
                          paymentStatusLabels[s] ??
                          (s === "unspecified" ? "Nespecificat" : s)
                        ).toLowerCase()}
                      </span>
                    ))}
                </div>
                {(c.manual_offset ?? 0) + c.manual_signup_count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Din locurile ocupate, adăugate de mână:{" "}
                    {(c.manual_offset ?? 0) + c.manual_signup_count}.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {onShowRegistrations && (
                    <Button
                      size="sm"
                      onClick={() => onShowRegistrations(c.id, title)}
                    >
                      Vezi înscrierile ({c.registration_count})
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editGroup(c.id)}
                  >
                    Editează grupa
                  </Button>
                  {slugs[c.id] && c.status !== "draft" && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={groupPagePath(slugs[c.id]!, "ro")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Pagina publică ↗
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
