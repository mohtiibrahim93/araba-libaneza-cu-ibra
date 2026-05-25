import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useKidsSlots, type KidsSlot } from "@/hooks/useKidsSlots";
import { Label } from "@/components/ui/label";
import { Loader2, Users, MapPin, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import LocalTimezoneToggle from "@/components/LocalTimezoneToggle";
import {
  BUCHAREST_TZ,
  getLocalTz,
  shortTzLabel,
  useShowLocalTz,
  weeklyBucharestInTz,
} from "@/lib/timezone";

interface Props {
  selectedSlotId: string | null;
  onSelect: (slot: KidsSlot | null) => void;
}

type FormatFilter = "all" | "online" | "physical";

const WEEKDAY_KEYS = [
  "weekdayMon",
  "weekdayTue",
  "weekdayWed",
  "weekdayThu",
  "weekdayFri",
  "weekdaySat",
  "weekdaySun",
] as const;

function formatTime(t: string) {
  return t.slice(0, 5);
}

const KidsSlotPicker = ({ selectedSlotId, onSelect }: Props) => {
  const { t } = useI18n();
  const { slots, loading } = useKidsSlots();
  const [filter, setFilter] = useState<FormatFilter>("all");
  const showLocalTz = useShowLocalTz();
  const localTz = useMemo(() => getLocalTz(), []);
  const localTzLabel = useMemo(() => shortTzLabel(localTz), [localTz]);

  const filtered = useMemo(
    () => (filter === "all" ? slots : slots.filter((s) => s.format === filter)),
    [slots, filter],
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        {t.kidsSlotPickerLoading}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        {t.kidsSlotPickerEmpty}
      </div>
    );
  }

  const tabs: { value: FormatFilter; label: string }[] = [
    { value: "all", label: t.kidsSlotAllFormats },
    { value: "online", label: t.kidsSlotFormatOnline },
    { value: "physical", label: t.kidsSlotFormatPhysical },
  ];

  return (
    <div className="space-y-2">
      <Label>{t.kidsSlotPickerLabel} *</Label>

      <div className="inline-flex rounded-md border border-border p-0.5 bg-muted/40">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              filter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <LocalTimezoneToggle />

      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((s) => {
          const active = s.id === selectedSlotId;
          const weekdayLabel = t[WEEKDAY_KEYS[Math.min(Math.max(s.weekday - 1, 0), 6)]];
          const lowSeats = s.seatsLeft > 0 && s.seatsLeft < 3;
          const local =
            showLocalTz && localTz !== BUCHAREST_TZ
              ? weeklyBucharestInTz(s.weekday, s.start_time.slice(0, 5), localTz)
              : null;
          const localWeekdayLabel = local
            ? t[WEEKDAY_KEYS[Math.min(Math.max(local.weekday - 1, 0), 6)]]
            : null;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(active ? null : s)}
              className={cn(
                "text-left rounded-lg border p-3 transition-colors",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              <p className="text-sm font-semibold text-foreground">
                {t.kidsSlotEvery} {weekdayLabel.toLowerCase()} · {formatTime(s.start_time)}
              </p>
              {local && localWeekdayLabel && !local.sameAsSource && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.tzYourTime} ({localTzLabel}): {localWeekdayLabel.toLowerCase()} · {local.time}
                </p>
              )}
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                {s.format === "online" ? (
                  <>
                    <Video className="w-3.5 h-3.5" />
                    {t.kidsSlotFormatOnline}
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    {s.location || t.kidsSlotFormatPhysical}
                  </>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                {s.full ? (
                  <span className="font-semibold text-primary">{t.cohortFull}</span>
                ) : (
                  <span
                    className={cn(
                      "font-medium",
                      lowSeats ? "text-primary animate-pulse" : "text-muted-foreground",
                    )}
                  >
                    {s.seatsLeft} {t.cohortSeatsLeft}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t.kidsSlotPickerHelp}</p>
    </div>
  );
};

export default KidsSlotPicker;