import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LevelAssessmentModal from "@/components/LevelAssessmentModal";
import type { LevelType, FormatType } from "./types";
import CohortPicker from "./CohortPicker";
import type { Cohort } from "@/hooks/useGroupCohorts";
import { ONLINE_PRICES, GROUP_COURSE_MONTHS, priceFor, formatLei } from "@/lib/pricing";

export type GroupPlan = "monthly" | "full";

interface Props {
  level: LevelType | "";
  onLevelChange: (level: LevelType) => void;
  format: FormatType | "";
  groupPlan: GroupPlan;
  onGroupPlanChange: (plan: GroupPlan) => void;
  cohortId: string | null;
  onCohortChange: (cohort: Cohort | null) => void;
  /** When true, hide the level selector and show the locked level as read-only. */
  locked?: boolean;
  /** Submit was rejected because no level was chosen — mark the field. */
  levelError?: boolean;
}

const GroupFields = ({
  level,
  onLevelChange,
  format,
  groupPlan,
  onGroupPlanChange,
  cohortId,
  onCohortChange,
  locked = false,
  levelError = false,
}: Props) => {
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {locked && level ? (
        <div className="space-y-2">
          <Label>{t.mainLeadLevelLabel}</Label>
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <span className="font-semibold text-foreground">{level}</span>
            <span className="text-muted-foreground"> — {
              level === "A1" ? t.levelA1Subtitle :
              level === "A2" ? t.levelA2Subtitle :
              level === "B1" ? t.levelB1Subtitle :
              level === "B2" ? t.levelB2Subtitle :
              level === "C1" ? t.levelC1Subtitle : t.levelC2Subtitle
            }</span>
          </div>
        </div>
      ) : (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="level">{t.mainLeadLevelLabel} *</Label>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-xs text-primary hover:underline underline-offset-2"
          >
            {t.levelQuizDontKnow}
          </button>
        </div>
        <Select value={level} onValueChange={(v) => onLevelChange(v as LevelType)}>
          <SelectTrigger
            id="level"
            aria-invalid={levelError || undefined}
            className={levelError ? "border-destructive focus:ring-destructive" : ""}
          >
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
        {levelError && (
          <p className="text-xs text-destructive">{t.mainLeadErrorLevel}</p>
        )}
        <p className="text-xs text-muted-foreground">{t.mainLeadLevelHelp}</p>
      </div>
      )}

      {!locked && <LevelAssessmentModal
        open={showModal}
        onOpenChange={setShowModal}
        onSelectLevel={onLevelChange}
      />}

      {level && (
        <CohortPicker
          formType="group"
          level={level}
          format={format || null}
          selectedCohortId={cohortId}
          onSelect={onCohortChange}
        />
      )}

      {level && (() => {
        const months = GROUP_COURSE_MONTHS[level as LevelType] ?? 4;
        const monthly = priceFor(
          ONLINE_PRICES.groupMonthly[level as LevelType] ?? 500,
          format || "online",
        );
        const fullBase = monthly * months;
        const fullDiscounted = Math.round(fullBase * 0.9);
        const options: { plan: GroupPlan; title: string; big: string; sub?: string; badge?: string }[] = [
          {
            plan: "monthly",
            title: t.groupPlanMonthly,
            big: `${formatLei(monthly)} LEI / lună`,
            sub: `× ${months} luni`,
          },
          {
            plan: "full",
            title: t.groupPlanFull,
            big: `${formatLei(fullDiscounted)} LEI`,
            sub: `${formatLei(fullBase)} LEI`,
            badge: "−10%",
          },
        ];
        return (
          <div className="space-y-2">
            <Label>{t.groupMonthsLabel} *</Label>
            <div className="grid grid-cols-2 gap-2">
              {options.map((o) => {
                const active = groupPlan === o.plan;
                return (
                  <button
                    key={o.plan}
                    type="button"
                    onClick={() => onGroupPlanChange(o.plan)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{o.title}</span>
                      {o.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {o.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-base font-bold text-foreground">{o.big}</p>
                    {o.plan === "full" && (
                      <p className="text-[11px] text-muted-foreground line-through">{o.sub} LEI</p>
                    )}
                    {o.plan === "monthly" && (
                      <p className="text-[11px] text-muted-foreground">{o.sub}</p>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">{t.groupMonthsHelp}</p>
          </div>
        );
      })()}
    </>
  );
};

export default GroupFields;