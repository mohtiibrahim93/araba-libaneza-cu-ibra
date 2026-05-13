import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  privateQuantity: number;
  onPrivateQuantityChange: (n: number) => void;
}

const clamp = (n: number) => Math.min(100, Math.max(1, n));

const PrivateFields = ({ privateQuantity, onPrivateQuantityChange }: Props) => {
  const { t } = useI18n();
  const total = privateQuantity * 150 * (privateQuantity >= 20 ? 0.85 : 1);

  return (
    <div className="space-y-2">
      <Label htmlFor="privateQuantity">{t.privateQuantityLabel} *</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPrivateQuantityChange(clamp(privateQuantity - 1))}
          className="w-10 h-10 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-lg font-semibold"
          aria-label="−"
        >
          −
        </button>
        <Input
          id="privateQuantity"
          type="number"
          min={1}
          max={100}
          value={privateQuantity}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            onPrivateQuantityChange(Number.isFinite(n) ? clamp(n) : 1);
          }}
          className="text-center font-semibold w-20"
        />
        <button
          type="button"
          onClick={() => onPrivateQuantityChange(clamp(privateQuantity + 1))}
          className="w-10 h-10 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-lg font-semibold"
          aria-label="+"
        >
          +
        </button>
        <div className="ml-auto text-right">
          <p className="text-sm font-semibold text-foreground">
            {total.toLocaleString("ro-RO")} LEI
          </p>
          {privateQuantity >= 20 ? (
            <p className="text-xs font-medium text-primary">{t.privateQuantityDiscountApplied}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t.privateQuantityDiscountHint.replace("{n}", String(20 - privateQuantity))}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t.privateQuantityHelp}</p>
    </div>
  );
};

export default PrivateFields;