import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useGroupCapacities } from "@/hooks/useGroupCapacity";

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

  if (loading) return null;
  const cap = get(formType, level ?? null);
  if (!cap) return null;

  const isWaitlist = cap.full;
  const isUrgent = !isWaitlist && cap.seatsLeft > 0 && cap.seatsLeft < 5;

  const tone = isWaitlist
    ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
    : isUrgent
      ? "border-primary/40 bg-primary/10 text-primary animate-pulse"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";

  let label: string;
  if (isWaitlist) {
    label = t.spotsWaitlist;
  } else if (compact) {
    label =
      cap.seatsLeft === 1
        ? t.spotsBadgeCompactOne
        : t.spotsBadgeCompactMany.replace("{n}", String(cap.seatsLeft));
  } else {
    const tpl = cap.seatsLeft === 1 ? t.spotsBadgeOne : t.spotsBadgeMany;
    label = tpl
      .replace("{n}", String(cap.seatsLeft))
      .replace("{level}", level ?? "")
      .replace("{cohort}", t.spotsCohort)
      // Clean up if level missing (kids)
      .replace(/\s+pentru\s+\s+—/, " —")
      .replace(/\s+for\s+\s+—/, " —");
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone} ${className}`}
    >
      <Users className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export default SpotsBadge;