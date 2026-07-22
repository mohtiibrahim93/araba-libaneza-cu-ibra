import { Link } from "react-router-dom";
import { CalendarDays, Clock, Users, MapPin, Wifi, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  type Course,
  courseStatusBadge,
  courseTitle,
  MODALITY_LABELS,
  type StatusTone,
} from "@/lib/courses";

const TONE_CLASS: Record<StatusTone, string> = {
  open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  low: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  waitlist: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  full: "bg-muted text-muted-foreground",
  soon: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  progress: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  done: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground line-through",
};

const fmtDate = (iso: string, lang: "ro" | "en") => {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const CourseCard = ({ course }: { course: Course }) => {
  const { lang } = useI18n();
  const badge = courseStatusBadge(course.status, course.seatsLeft);
  const schedule = lang === "en" ? course.schedule_label_en : course.schedule_label_ro;
  const price = course.price_lei;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          {course.level && (
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {lang === "en" ? "Level" : "Nivel"} {course.level.toUpperCase()}
            </span>
          )}
          <h3 className="mt-0.5 text-lg font-bold leading-snug text-foreground">
            {courseTitle(course, lang)}
          </h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[badge.tone]}`}>
          {lang === "en" ? badge.en : badge.ro}
        </span>
      </div>

      <ul className="mb-4 space-y-1.5 text-sm text-muted-foreground">
        {course.format && (
          <li className="flex items-center gap-2">
            {course.format === "online" ? <Wifi className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
            {MODALITY_LABELS[course.format][lang === "en" ? "en" : "ro"]}
          </li>
        )}
        <li className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          {lang === "en" ? "Starts" : "Începe"} {fmtDate(course.start_date, lang)}
        </li>
        {schedule && (
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {schedule}
          </li>
        )}
        <li className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          {course.full
            ? lang === "en" ? "Waitlist" : "Listă de așteptare"
            : `${course.seatsLeft ?? course.max_seats} ${lang === "en" ? "seats left" : "locuri libere"}`}
        </li>
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-sm font-semibold text-foreground">
          {price != null ? `${price} LEI` : ""}
        </span>
        {course.slug ? (
          <Link
            to={`/cursuri/curs/${course.slug}`}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {lang === "en" ? "See details" : "Vezi detalii"}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">{lang === "en" ? "Details soon" : "Detalii în curând"}</span>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
