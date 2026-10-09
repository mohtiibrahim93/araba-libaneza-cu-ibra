import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The disclosure that lets the reCAPTCHA badge stay hidden.
 *
 * reCAPTCHA v3 loads on every page and draws a floating badge in the
 * bottom-right corner — the same corner the WhatsApp and phone buttons are
 * pinned to, which is why it was sitting on top of them. Google's terms allow
 * hiding the badge on one condition: this sentence, with links to their
 * privacy policy and terms, visible in the user flow instead. So the badge is
 * hidden in `styles.css` and this is what pays for it. The two go together:
 * hiding the badge without showing this would breach the terms, which is why
 * a test asserts both.
 *
 * Rendered in the footer, so it is present wherever the script is, and again
 * beside the registration form's consent box, where reCAPTCHA actually runs
 * and where someone is being asked to submit something.
 *
 * The sentence is Google's required wording and already names both documents;
 * the links that follow are short because they are the thing to click, not a
 * second copy of the sentence.
 */
const RecaptchaNotice = ({ className }: { className?: string }) => {
  const { t } = useI18n();
  const link = "underline underline-offset-2 hover:text-foreground transition-colors";

  return (
    <p className={cn("text-[11px] leading-relaxed text-muted-foreground", className)}>
      {t.recaptchaNotice}{" "}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={link}>
        {t.recaptchaPrivacyShort}
      </a>
      {" · "}
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className={link}>
        {t.recaptchaTermsShort}
      </a>
    </p>
  );
};

export default RecaptchaNotice;
