import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ONLINE_PRICES,
  formatLei,
  nextPrivateTier,
  priceFor,
  privateDiscountFor,
  type CourseFormat,
} from "@/lib/pricing";

interface Props {
  privateQuantity: number;
  onPrivateQuantityChange: (n: number) => void;
  /** Selected lesson format — drives unit price (online vs in-center). */
  format?: CourseFormat | "";
  /** Per-lesson base price (online). Defaults to standard private lesson. */
  basePriceOnline?: number;
}

const clamp = (n: number) => Math.min(100, Math.max(1, n));

// The discount ladder lives in @/lib/pricing so the form, the price cards and
// the Stripe functions all read one definition. There are two tiers, 10 and 20
// — the -5%-at-5-lessons tier this file used to apply was never a real offer.
const QUICK_PICKS = [1, 10, 20];

const PrivateFields = ({
  privateQuantity,
  onPrivateQuantityChange,
  format,
  basePriceOnline = ONLINE_PRICES.privateLesson,
}: Props) => {
  const { t } = useI18n();
  const unit = priceFor(basePriceOnline, format === "fizic" ? "fizic" : "online");
  const discount = privateDiscountFor(privateQuantity);
  const subtotal = privateQuantity * unit;
  const total = subtotal * (1 - discount);
  const saved = subtotal - total;
  const next = nextPrivateTier(privateQuantity);

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
          {discount > 0 ? (
            <p className="text-sm font-semibold text-foreground">
              <span className="text-muted-foreground line-through font-normal mr-1.5">
                {formatLei(Math.round(subtotal))}
              </span>
              {formatLei(Math.round(total))} LEI
            </p>
          ) : (
            <p className="text-sm font-semibold text-foreground">
              {formatLei(Math.round(total))} LEI
            </p>
          )}
          {discount > 0 ? (
            <p className="text-xs font-medium text-primary">
              {t.privateQuantityDiscountApplied.replace("{p}", String(Math.round(discount * 100)))}
              {" · "}
              {t.privateQuantitySaved.replace("{amount}", formatLei(Math.round(saved)))}
            </p>
          ) : next ? (
            <p className="text-xs text-muted-foreground">
              {t.privateQuantityDiscountHint
                .replace("{n}", String(next.needed))
                .replace("{p}", String(next.pct))}
            </p>
          ) : null}
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {t.privateQuantityPerLesson.replace("{price}", formatLei(unit))}
          </p>
        </div>
      </div>

      {/* Quick-pick chips for popular packs */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-muted-foreground">{t.privateQuantityQuickPick}</span>
        {QUICK_PICKS.map((n) => {
          const active = privateQuantity === n;
          const d = privateDiscountFor(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => onPrivateQuantityChange(n)}
              className={
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors " +
                (active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/50")
              }
            >
              {n}
              {d > 0 ? ` · −${Math.round(d * 100)}%` : ""}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">{t.privateQuantityHelp}</p>
    </div>
  );
};

export default PrivateFields;