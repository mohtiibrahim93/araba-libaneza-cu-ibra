import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useGroupCohorts, type Cohort } from "@/hooks/useGroupCohorts";
import { Label } from "@/components/ui/label";
import { Calendar, CalendarOff, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function statusBadge(status: Cohort["status"], t: ReturnType<typeof useI18n>["t"]) {
  switch (status) {
    case "minimum_reached":
      return { label: t.cohortStatusMinReached, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30" };
    case "confirmed":
      return { label: t.cohortStatusConfirmed, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" };
    case "in_progress":
      return { label: t.cohortStatusInProgress, tone: "bg-muted text-muted-foreground border-border" };
    case "forming":
    default:
      return { label: t.cohortStatusForming, tone: "bg-primary/10 text-primary border-primary/30" };
  }
}

interface Props {
  formType: "group" | "kids";
  level?: string | null;
  format?: string | null;
  selectedCohortId: string | null;
  onSelect: (cohort: Cohort | null) => void;
}

function formatStart(iso: string, lang: "ro" | "en") {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "ro" ? "ro-RO" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

const CohortPicker = ({ formType, level, format, selectedCohortId, onSelect }: Props) => {
  const { t, lang } = useI18n();
  // Fetch every language, then filter here rather than in the query. The
  // language a student wants to be taught in is not the language they happen to
  // be reading the site in — someone reading Romanian may want English lessons,
  // and an English reader should still see Romanian classes when those are the
  // only ones running. Fetching all of them is also what lets us tell whether
  // there is a real choice to offer.
  const { cohorts: allCohorts, loading } = useGroupCohorts(
    formType,
    level ?? null,
    format ?? null,
    null,
  );

  const languagesAvailable = useMemo(
    () => Array.from(new Set(allCohorts.map((c) => c.teaching_language))).sort(),
    [allCohorts],
  );

  // Default to the language being read, but only if classes exist in it —
  // otherwise start on a language that actually has something to join.
  const [chosen, setChosen] = useState<"ro" | "en" | null>(null);
  const teachingLanguage: "ro" | "en" =
    chosen ?? (languagesAvailable.includes(lang) ? lang : (languagesAvailable[0] as "ro" | "en") ?? lang);

  const cohorts = useMemo(
    () => allCohorts.filter((c) => c.teaching_language === teachingLanguage),
    [allCohorts, teachingLanguage],
  );

  // Selecting a different language cannot leave a cohort from the old one
  // selected underneath.
  const switchLanguage = (next: "ro" | "en") => {
    if (next === teachingLanguage) return;
    setChosen(next);
    if (selectedCohortId && !allCohorts.some((c) => c.id === selectedCohortId && c.teaching_language === next)) {
      onSelect(null);
    }
  };

  const languageChoice = languagesAvailable.length > 1 && (
    <div className="space-y-2">
      <Label>{lang === "en" ? "Language of instruction" : "Limba de predare"} *</Label>
      <div className="flex flex-wrap gap-2">
        {(languagesAvailable as ("ro" | "en")[]).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => switchLanguage(code)}
            aria-pressed={code === teachingLanguage}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors min-h-11",
              code === teachingLanguage
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border hover:border-primary/50",
            )}
          >
            {code === "en"
              ? lang === "en" ? "English" : "Engleză"
              : lang === "en" ? "Romanian" : "Română"}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        {t.cohortPickerLoading}
      </div>
    );
  }

  if (cohorts.length === 0) {
    // No class in the language they picked. The selector stays on screen so
    // switching back is one click rather than a dead end, and the message still
    // names the gap — the difference between "nothing available" and a student
    // who knows to ask.
    return (
      <div className="space-y-3">
        {languageChoice}
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {teachingLanguage === "en" ? t.cohortPickerEmptyEn : t.cohortPickerEmpty}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {languageChoice}
      <Label>{t.cohortPickerLabel} *</Label>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cohorts.map((c) => {
          const active = c.id === selectedCohortId;
          const label = lang === "ro" ? c.schedule_label_ro : c.schedule_label_en;
          const breakNote = lang === "ro" ? c.break_note_ro : c.break_note_en;
          const lowSeats = c.seatsLeft > 0 && c.seatsLeft < 5;
          const badge = statusBadge(c.status, t);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(active ? null : c)}
              className={cn(
                "text-left rounded-lg border p-3 transition-colors",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Calendar className="w-3.5 h-3.5" />
                  {t.cohortStartsOn}
                </div>
                <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium", badge.tone)}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {formatStart(c.start_date, lang)}
              </p>
              {label && <p className="text-xs text-muted-foreground mt-1">{label}</p>}
              {c.end_date && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t.cohortEndsOn} {formatStart(c.end_date, lang)}
                  {/* Said out loud rather than implied: the end date already
                      allows for a holiday break whose exact dates are settled
                      with the group, so stating it flatly would be a promise
                      the calendar has not made yet. */}
                  {c.end_date_is_estimate && (
                    <span className="italic"> ({t.cohortEndEstimate})</span>
                  )}
                </p>
              )}
              {breakNote && (
                <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <CalendarOff className="w-3.5 h-3.5 mt-px flex-shrink-0" aria-hidden="true" />
                  <span>{breakNote}</span>
                </p>
              )}
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                {c.full ? (
                  <span className="font-semibold text-primary">{t.cohortFull}</span>
                ) : (
                  <span
                    className={cn(
                      "font-medium",
                      lowSeats ? "text-primary animate-pulse" : "text-muted-foreground",
                    )}
                  >
                    {c.seatsLeft} {t.cohortSeatsLeft}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t.cohortPickerHelp}</p>
    </div>
  );
};

export default CohortPicker;