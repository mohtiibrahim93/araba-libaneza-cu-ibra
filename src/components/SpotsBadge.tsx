import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useGroupCapacities, type CapacityInfo } from "@/hooks/useGroupCapacity";

interface SpotsBadgeProps {
  formType: "group" | "kids";
  level?: string | null;
  /** When true, show only "X locuri" without level/cohort suffix (compact variant). */
  compact?: boolean;
  className?: string;
}

const SpotsBadge = ({ formType, level, compact = false, className = "" }: SpotsBadgeProps) => {
  const { t } = useI18n();
  const { get, getFormats, loading } = useGroupCapacities();

  if (loading) return null;

  // Kids: single row, no format split.
  if (formType === "kids") {
    const cap = get("kids", null);
    if (!cap) return null;
    return renderBadge(seatsLabel(cap), cap.full, isUrgent(cap));
  }

  // Group: fizic and online tracked apart — never summed into one number.
  const { fizic, online } = getFormats(level);
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
