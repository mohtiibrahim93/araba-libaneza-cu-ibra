import { Link } from "react-router-dom";
import { CalendarClock, MapPin, Monitor, ChevronRight, Flame } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useActiveCohorts } from "@/hooks/useActiveCohorts";

const dayMs = 24 * 60 * 60 * 1000;

const ActiveCoursesBanner = () => {
  const { t, lang } = useI18n();
  const { cohorts, loading } = useActiveCohorts();

  if (loading || cohorts.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
      day: "numeric",
      month: "long",
    });

  return (
    <section className="px-6 py-8 bg-background border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
            {t.activeNowTitle}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((c) => {
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

            return (
              <Link
                key={c.id}
                to={href}
                className="group flex flex-col rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary hover:bg-primary/10"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
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
                  </span>
                  <span className="text-[11px] font-semibold rounded-full bg-primary text-primary-foreground px-2 py-0.5 whitespace-nowrap">
                    {urgency}
                  </span>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                  {t.activeNowStartLabel} {fmtDate(c.start_date)}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {lang === "en" ? c.schedule_label_en : c.schedule_label_ro}
                </p>

                {!c.full && c.seatsLeft <= 4 && (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-500 mb-3">
                    {t.capSpotsLeft.replace("{n}", String(c.seatsLeft))}
                  </p>
                )}

                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {t.activeNowCta}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ActiveCoursesBanner;
