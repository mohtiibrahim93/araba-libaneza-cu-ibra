import { useI18n } from "@/lib/i18n";
import { AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CapacityInfo } from "@/hooks/useGroupCapacity";
import KidsSlotPicker from "./KidsSlotPicker";
import type { KidsSlot } from "@/hooks/useKidsSlots";

interface Props {
  childName: string;
  childAge: string;
  payDeposit: boolean;
  capacity: CapacityInfo | null;
  kidsSlotId: string | null;
  onKidsSlotChange: (slot: KidsSlot | null) => void;
  onChildNameChange: (v: string) => void;
  onChildAgeChange: (v: string) => void;
  onPayDepositChange: (v: boolean) => void;
}

const KidsFields = ({
  childName,
  childAge,
  payDeposit,
  capacity,
  kidsSlotId,
  onKidsSlotChange,
  onChildNameChange,
  onChildAgeChange,
  onPayDepositChange,
}: Props) => {
  const { t } = useI18n();

  return (
    <>
      <KidsSlotPicker selectedSlotId={kidsSlotId} onSelect={onKidsSlotChange} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="childName">{t.kidsChildName} *</Label>
          <Input
            id="childName"
            value={childName}
            onChange={(e) => onChildNameChange(e.target.value)}
            placeholder={t.kidsChildNamePlaceholder}
            required
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="childAge">{t.kidsChildAge} *</Label>
          <Input
            id="childAge"
            value={childAge}
            onChange={(e) => onChildAgeChange(e.target.value)}
            placeholder={t.kidsChildAgePlaceholder}
            required
            maxLength={20}
          />
        </div>
      </div>

      {capacity?.belowMin && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t.kidsWaitlistTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.kidsWaitlistDesc}</p>
            </div>
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={payDeposit}
              onCheckedChange={(v) => onPayDepositChange(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground">{t.kidsWaitlistCheckbox}</span>
          </label>
        </div>
      )}
    </>
  );
};

export default KidsFields;