import { Link } from "@/lib/router-compat";
import { useCourses } from "@/hooks/useCourses";
import { useI18n } from "@/lib/i18n";
import { groupPagePath, levelPagePath } from "@/lib/groupPage";
import {
  GROUP_COURSE_MONTHS,
  ONLINE_PRICES,
  formatLei,
  priceFor,
} from "@/lib/pricing";
import type { Course } from "@/lib/courses";

/**
 * "Grupe care se formează acum" (owner, 1 Nov 2026).
 *
 * The upcoming groups used to be two lines of text above the level grid, easy
 * to miss and without their own page. Each group that has not started gets a
 * card: date, schedule, teaching language, free places and the price, with a
 * link to its own page (src/lib/groupPage.ts). The places count free seats,
 * "4 din 6 locuri libere", as everywhere else on the site.
 *
 * Same data as the rest of the site (useCourses: public statuses, starting
 * today or later, places from get_cohort_signup_counts). While loading or with
 * none forming it renders nothing, or the evergreen sentence with `fallback`.
 */
const DAY_MS = 86_400_000;

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / DAY_MS,
  );
}

function GroupCard({ c, lang }: { c: Course; lang: "ro" | "en" }) {
  const date = new Date(`${c.start_date}T00:00:00`);
  const month = date
    .toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  const days = daysUntil(c.start_date);
  const level = (c.level ?? "A1").toUpperCase();
  const levelKey = level as keyof typeof GROUP_COURSE_MONTHS;
  const monthly =
    ONLINE_PRICES.groupMonthly[levelKey] != null
      ? priceFor(
          ONLINE_PRICES.groupMonthly[levelKey],
          c.format === "fizic" ? "fizic" : "online",
        )
      : null;
  const free = c.seatsLeft ?? c.max_seats;
  const taken = c.taken ?? 0;
  const format =
    c.format === "fizic" ? (lang === "en" ? "In person" : "Fizic") : "Online";
  const taught =
    c.teaching_language === "en"
      ? lang === "en"
        ? "taught in English"
        : "predare în engleză"
      : lang === "en"
        ? "taught in Romanian"
        : "predare în română";
  const page = c.slug ? groupPagePath(c.slug, lang) : null;
  const signUp = page ? `${page}#inscriere` : levelPagePath(c.level, lang);
  const schedule = lang === "en" ? c.schedule_label_en : c.schedule_label_ro;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className="w-14 shrink-0 rounded-xl border border-border py-1.5 text-center">
          <div className="text-[0.6875rem] font-bold tracking-wide text-primary">
            {month}
          </div>
          <div className="text-2xl font-bold leading-tight text-foreground">
            {date.getDate()}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {level} · {format} · {taught}
          </h3>
          {schedule && (
            <p className="mt-1 text-sm text-muted-foreground">
              {schedule.split(" · ")[0]}
            </p>
          )}
        </div>
        {days > 0 && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {lang === "en"
              ? `starts in ${days} ${days === 1 ? "day" : "days"}`
              : `începe în ${days} ${days === 1 ? "zi" : days < 20 ? "zile" : "de zile"}`}
          </span>
        )}
      </div>

      {c.full ? (
        <p className="text-sm font-semibold text-foreground">
          {lang === "en"
            ? "Full — waiting list"
            : "Completă — listă de așteptare"}
        </p>
      ) : (
        <div className="space-y-1.5">
          <p className="text-sm text-foreground">
            <strong>
              {lang === "en"
                ? `${free} of ${c.max_seats}`
                : `${free} din ${c.max_seats}`}
            </strong>{" "}
            {lang === "en" ? "places free" : "locuri libere"}
          </p>
          <div
            role="img"
            aria-label={
              lang === "en"
                ? `${free} of ${c.max_seats} places free`
                : `${free} din ${c.max_seats} locuri libere`
            }
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${c.max_seats}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: c.max_seats }, (_, i) => (
              <span
                key={i}
                className={`h-2.5 rounded-sm ${i < taken ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      )}

      {monthly != null && (
        <p className="text-sm text-foreground">
          <strong>{formatLei(monthly, lang)} lei</strong>{" "}
          <span className="text-muted-foreground">
            {lang === "en"
              ? `/ month · ${GROUP_COURSE_MONTHS[levelKey]} months`
              : `/ lună · ${GROUP_COURSE_MONTHS[levelKey]} luni`}
          </span>
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3">
        <Link
          to={signUp}
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {lang === "en" ? "Join this group" : "Înscrie-te în grupă"}
        </Link>
        {page && (
          <Link
            to={page}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            {lang === "en" ? "Group details →" : "Detalii grupă →"}
          </Link>
        )}
      </div>
    </article>
  );
}

export default function FormingGroups({
  level,
  fallback = false,
  className = "",
}: {
  /** Only this level's groups (on a level page). */
  level?: string;
  /**
   * While loading or with no group forming, show the evergreen sentence the
   * old two-line note showed ("groups start regularly, ask us"). It is also
   * what the server render, and so a crawler, gets.
   */
  fallback?: boolean;
  className?: string;
}) {
  const { t, lang } = useI18n();
  const { courses, loading } = useCourses({});
  const groups = courses
    .filter((c) => c.form_type === "group")
    .filter(
      (c) => !level || (c.level ?? "").toUpperCase() === level.toUpperCase(),
    )
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  if (loading || groups.length === 0)
    return fallback ? (
      <p className={`text-sm font-medium text-primary max-w-2xl ${className}`}>
        {t.cohortNoteFallback}
      </p>
    ) : null;
  const l = lang === "en" ? "en" : "ro";

  return (
    <section
      aria-labelledby="forming-groups"
      className={`rounded-2xl border border-border bg-muted/30 p-5 sm:p-7 ${className}`}
    >
      <h2
        id="forming-groups"
        className="font-display text-2xl font-bold tracking-tight text-foreground"
      >
        {lang === "en" ? "Groups forming now" : "Grupe care se formează acum"}
      </h2>
      <p className="mt-1 mb-5 max-w-2xl text-sm text-muted-foreground">
        {lang === "en"
          ? "A group is confirmed as soon as half its places are taken."
          : "O grupă e confirmată imediat ce se ocupă jumătate din locuri."}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((c) => (
          <GroupCard key={c.id} c={c} lang={l} />
        ))}
      </div>
    </section>
  );
}
