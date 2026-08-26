import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

interface GdprCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /**
   * Validation message shown inline, next to the control itself. A corner
   * toast alone is easy to miss here: the eye is on the checkbox and the
   * submit button, so an unchecked box reads as "nothing happened".
   */
  error?: string;
}

const GdprCheckbox = ({ checked, onCheckedChange, error }: GdprCheckboxProps) => {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <Checkbox
          id="gdpr"
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "gdpr-error" : undefined}
          className={`mt-0.5 ${error ? "border-destructive ring-2 ring-destructive/30" : ""}`}
        />
        <Label
          htmlFor="gdpr"
          className={`text-xs font-normal cursor-pointer leading-relaxed ${
            error ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {t.gdprConsent}{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            {t.gdprPrivacy}
          </a>
        </Label>
      </div>
      {error && (
        <p id="gdpr-error" role="alert" className="text-xs font-medium text-destructive pl-6">
          {error}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
        {t.recaptchaNotice.split("Google")[0]}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Google Privacy Policy
        </a>
        {" / "}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Terms of Service
        </a>
        .
      </p>
    </div>
  );
};

export default GdprCheckbox;
