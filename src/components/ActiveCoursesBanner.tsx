import { minGroupSize } from "@/lib/groupSize";
import { Link } from "@/lib/router-compat";
import { MapPin, Monitor, ChevronRight, Flame, Users } from "lucide-react";
import { getCurriculum } from "@/data/curriculum";
import { useI18n } from "@/lib/i18n";
import { useActiveCohorts } from "@/hooks/useActiveCohorts";

const dayMs = 24 * 60 * 60 * 1000;

const ActiveCoursesBanner = () => {
  const { t, lang } = useI18n();
  const { cohorts, loading } = useActiveCohorts();

  // Homepage shows only groups you can still join from day one. Already-
  // running cohorts ("start 2 septembrie" in late September) read as stale
  // to a first-time visitor; they are listed on /cursuri/grup instead,
  // where someone comparing levels actually wants the full picture.
  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = cohorts.filter((c) => c.start_date > todayIso).slice(0, 3);

  if (loading || upcoming.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthShort = (d: string) =>
    new Date(d + "T00:00:00")
      .toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", { month: "short" })
      .replace(".", "")
      .toUpperCase();
  const dayOfMonth = (d: string) => new Date(d + "T00:00:00").getDate();
  const curriculum = getCurriculum(lang === "en" ? "en" : "ro");

  return (
    <section className="px-gutter py-section-sm bg-background border-y border-border">
      <div className="w-full max-w-content mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Flame className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-primary sm:text-2xl">
              {t.activeNowTitle}
            </h2>
          </div>
          <Link to="/cursuri/grup" className="shrink-0 whitespace-nowrap text-sm font-semibold text-primary hover:underline underline-offset-4">
            {lang === "en" ? "All groups →" : "Toate grupele →"}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((c) => {
            const start = new Date(c.start_date + "T00:00:00");
            const days = Math.round((start.getTime() - today.getTime()) / dayMs);
            const started = days <= 0;
            const online = c.format === "online";

            const urgency = c.full
              ? t.activeNowFull
              : days === 0
                ? t.activeNowToday
                : started
                  ? t.activeNowRunning
                  : t.activeNowStartsIn.replace("{n}", String(days));

            const level = (c.level || "A1").toUpperCase();
            const href = `/cursuri/grup/${level.toLowerCase()}${c.format ? `?mod=${c.format}` : ""}`;
            const lessons = curriculum.find((l) => l.id === level.toLowerCase())?.lessons;
            // The admin label repeats the date, lesson count and group size
            // after the times ("… · start sâmbătă, 17 octombrie · 32 de
            // lecții · maximum 6 cursanți"); the card shows those itself, so
            // only the days and times are kept.
            const label = (lang === "en" ? c.schedule_label_en : c.schedule_label_ro) || "";
            const times = label.split(" · ")[0];

            return (
              <Link
                key={c.id}
                to={href}
                className="group flex gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary hover:bg-primary/10"
              >
                {/* Calendar tile: the start date at a glance. */}
                <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-background" aria-hidden="true">
                  <span className="text-[11px] font-bold tracking-wide text-primary">{monthShort(c.start_date)}</span>
                  <span className="font-display text-2xl font-bold leading-none text-foreground">{dayOfMonth(c.start_date)}</span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="inline-flex flex-wrap items-center gap-x-1.5 text-sm font-bold text-foreground">
                      {level}
                      <span className="text-muted-foreground">·</span>
                      {online ? (
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Monitor className="w-3.5 h-3.5 text-primary" />
                          {t.spotsOnline}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {t.spotsFizic}
                        </span>
                      )}
                      {lessons && (
                        <span className="font-normal text-muted-foreground">
                          · {lessons} {lang === "en" ? "lessons" : "de lecții"}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-semibold rounded-full bg-primary text-primary-foreground px-2 py-0.5 whitespace-nowrap">
                      {urgency}
                    </span>
                  </div>

                  {times && <p className="text-xs text-muted-foreground mb-2">{times}</p>}

                  {/* Each group counts its own seats — the Romanian and the
                      English class are separate groups, never one shared total. */}
                  <p className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-3">
                    <Users className="w-3.5 h-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      {lang === "en" ? "Taught in " : "Predare în "}
                      {c.teaching_language === "en"
                        ? lang === "en" ? "English" : "engleză"
                        : lang === "en" ? "Romanian" : "română"}
                      {" · "}
                      <span className={c.full || c.seatsLeft <= 2 ? "text-amber-600 dark:text-amber-500" : undefined}>
                        {c.taken} / {c.max_seats} {t.capSeatsLabel}
                      </span>
                    </span>
                  </p>
                  {/* A group starts once half its places are taken (3 of 6, 4 of 8). */}
                  <p className="text-xs text-muted-foreground mb-3 -mt-2">
                    {lang === "en"
                      ? `Starts with minimum ${minGroupSize(c.max_seats)}/${c.max_seats} enrolled`
                      : `Pornește cu minimum ${minGroupSize(c.max_seats)}/${c.max_seats} înscriși`}
                  </p>


                  <span className="mt-auto inline-flex self-start items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
                    {lang === "en" ? "Enroll" : "Înscrie-te"}
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ActiveCoursesBanner;
