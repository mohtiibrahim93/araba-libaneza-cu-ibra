import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

interface GdprCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const GdprCheckbox = ({ checked, onCheckedChange }: GdprCheckboxProps) => {
  const { t } = useI18n();

  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id="gdpr"
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5"
      />
      <Label htmlFor="gdpr" className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed">
        {t.gdprConsent}{" "}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {t.gdprPrivacy}
        </a>
      </Label>
    </div>
  );
};

export default GdprCheckbox;
