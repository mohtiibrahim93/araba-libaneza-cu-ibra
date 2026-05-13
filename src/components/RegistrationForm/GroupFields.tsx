import { useI18n } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LevelType } from "./types";

interface Props {
  level: LevelType | "";
  onLevelChange: (level: LevelType) => void;
  groupMonths: 1 | 3;
  onGroupMonthsChange: (months: 1 | 3) => void;
}

const MONTHLY_PRICE_BY_LEVEL: Record<LevelType, number> = {
  A1: 500,
  A2: 600,
  B1: 700,
  B2: 800,
  C1: 900,
  C2: 1000,
};

const GroupFields = ({ level, onLevelChange, groupMonths, onGroupMonthsChange }: Props) => {
  const { t } = useI18n();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="level">{t.mainLeadLevelLabel} *</Label>
        <Select value={level} onValueChange={(v) => onLevelChange(v as LevelType)}>
          <SelectTrigger id="level">
            <SelectValue placeholder={t.mainLeadLevelPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A1">A1 — {t.levelA1Subtitle}</SelectItem>
            <SelectItem value="A2">A2 — {t.levelA2Subtitle}</SelectItem>
            <SelectItem value="B1">B1 — {t.levelB1Subtitle}</SelectItem>
            <SelectItem value="B2">B2 — {t.levelB2Subtitle}</SelectItem>
            <SelectItem value="C1">C1 — {t.levelC1Subtitle}</SelectItem>
            <SelectItem value="C2">C2 — {t.levelC2Subtitle}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t.mainLeadLevelHelp}</p>
      </div>

      {level && (
        <div className="space-y-2">
          <Label>{t.groupMonthsLabel} *</Label>
          <div className="grid grid-cols-2 gap-2">
            {([1, 3] as const).map((m) => {
              const monthly = MONTHLY_PRICE_BY_LEVEL[level as LevelType] || 500;
              const base = monthly * m;
              const total = m === 3 ? Math.round(base * 0.9) : base;
              const active = groupMonths === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onGroupMonthsChange(m)}
                  className={`text-left rounded-lg border p-3 transition-colors ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {m === 1 ? t.groupMonthsOption1 : t.groupMonthsOption3}
                    </span>
                    {m === 3 && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        −10%
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-base font-bold text-foreground">
                    {total.toLocaleString("ro-RO")} LEI
                  </p>
                  {m === 3 && (
                    <p className="text-[11px] text-muted-foreground line-through">
                      {base.toLocaleString("ro-RO")} LEI
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">{t.groupMonthsHelp}</p>
        </div>
      )}
    </>
  );
};

export default GroupFields;