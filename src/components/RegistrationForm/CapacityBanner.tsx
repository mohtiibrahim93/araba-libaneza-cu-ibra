import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { CapacityInfo } from "@/hooks/useGroupCapacity";

interface Props {
  capacity: CapacityInfo;
}

const CapacityBanner = ({ capacity }: Props) => {
  const { t } = useI18n();

  const tone = capacity.full
    ? "border-destructive/40 bg-destructive/5"
    : capacity.belowMin
      ? "border-amber-500/40 bg-amber-500/5"
      : "border-primary/30 bg-primary/5";

  const description = capacity.full
    ? t.capFull
    : capacity.belowMin
      ? t.capNeedToStart.replace("{n}", String(capacity.needToStart))
      : t.capSpotsLeft.replace("{n}", String(capacity.seatsLeft));

  return (
    <div className={`rounded-lg border px-4 py-3 ${tone}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Users className="w-4 h-4 text-primary" />
        <span>
          {capacity.taken} / {capacity.max} {t.capSeatsLabel}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
};

export default CapacityBanner;