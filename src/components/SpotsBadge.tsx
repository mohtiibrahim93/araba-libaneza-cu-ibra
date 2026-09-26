import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useGroupCapacities, type CapacityInfo } from "@/hooks/useGroupCapacity";
import { useGroupCohorts, type Cohort } from "@/hooks/useGroupCohorts";

interface SpotsBadgeProps {
  formType: "group" | "kids";
  level?: string | null;
  /** When true, show only "X locuri" without level/cohort suffix (compact variant). */
  compact?: boolean;
  className?: string;
}

const SpotsBadge = ({ formType, level, compact = false, className = "" }: SpotsBadgeProps) => {
  const { t } = useI18n();
  const { get, loading } = useGroupCapacities();
  // Groups count the seats of the groups still open to join. The level-wide
  // capacity row also counted groups that are already running, so a full
  // August class made the October ones read "full" while every seat was free.
  const { cohorts, loading: cohortsLoading } = useGroupCohorts("group", level ?? null, null, null);

  if (formType === "kids" ? loading : cohortsLoading) return null;

  // Kids: single row, no format split.
  if (formType === "kids") {
    const cap = get("kids", null);
    if (!cap) return null;
    return renderBadge(seatsLabel(cap), cap.full, isUrgent(cap));
  }

  // Group: fizic and online tracked apart — never summed into one number.
  const fizic = seatsOf(cohorts.filter((c) => c.format !== "online"));
  const online = seatsOf(cohorts.filter((c) => c.format === "online"));
  const present = [
    { info: fizic, label: t.spotsFizic },
    { info: online, label: t.spotsOnline },
  ].filter((f): f is { info: CapacityInfo; label: string } => f.info != null);
  if (present.length === 0) return null;

  const allFull = present.every((f) => f.info.full);
  const anyUrgent = present.some((f) => !f.info.full && f.info.seatsLeft > 0 && f.info.seatsLeft < 5);

  const label = allFull
    ? t.spotsWaitlist
    : present
        .map((f) => `${f.info.full ? t.spotsFormatFull : seatsLabel(f.info)} ${f.label}`)
        .join(" · ");

  return renderBadge(label, allFull, anyUrgent);

  function seatsOf(list: Cohort[]): CapacityInfo | null {
    if (list.length === 0) return null;
    const max = list.reduce((n, c) => n + c.max_seats, 0);
    const taken = list.reduce((n, c) => n + c.taken, 0);
    return {
      taken,
      max,
      min: 0,
      seatsLeft: Math.max(0, max - taken),
      needToStart: 0,
      belowMin: false,
      full: taken >= max,
    };
  }
  function seatsLabel(info: CapacityInfo) {
    return info.seatsLeft === 1
      ? t.spotsSeatShortOne
      : t.spotsSeatsShort.replace("{n}", String(info.seatsLeft));
  }
  function isUrgent(info: CapacityInfo) {
    return !info.full && info.seatsLeft > 0 && info.seatsLeft < 5;
  }
  function renderBadge(text: string, waitlist: boolean, urgent: boolean) {
    const tone = waitlist
      ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : urgent
        ? "border-primary/40 bg-primary/10 text-primary animate-pulse"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone} ${className}`}
      >
        <Users className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{text}</span>
      </span>
    );
  }
};

export default SpotsBadge;
