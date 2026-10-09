import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import RecaptchaNotice from "@/components/RecaptchaNotice";

interface GdprCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /**
   * Validation message shown inline, next to the control itself. A corner
   * toast alone is easy to miss here: the eye is on the checkbox and the
   * submit button, so an unchecked box reads as "nothing happened".
   */
  error?: string | undefined;
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
      {/* Was assembled by splitting the sentence on the word "Google" and
          appending two English link labels, so the Romanian read "...și
          Termenii Google Privacy Policy / Terms of Service." One component
          now, in both languages, shared with the footer. */}
      <RecaptchaNotice className="pl-6" />
    </div>
  );
};

export default GdprCheckbox;
