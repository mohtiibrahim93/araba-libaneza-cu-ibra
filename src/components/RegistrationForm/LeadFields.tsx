import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CourseType } from "./types";
import { useState } from "react";

// Romanian mobile or international E.164. Strip spaces / dashes / parens before testing.
const PHONE_RE = /^(?:\+[1-9]\d{6,14}|0[27]\d{8})$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
// Mailboxes that cannot meaningfully receive a booking confirmation. admin@ is
// deliberately NOT here: admin@firma.ro is a normal business address and a
// plausible lead, so refusing it lost real people.
const EMAIL_BLOCKLIST = /^(no-?reply|noreply|test|postmaster|mailer-daemon)@/i;

const normalizePhone = (raw: string) => raw.replace(/[\s\-().]/g, "");

export const isValidPhone = (raw: string) => PHONE_RE.test(normalizePhone(raw));
export const isValidEmail = (raw: string) => {
  if (!raw) return true; // optional
  const v = raw.trim();
  if (v.length > 255) return false;
  if (EMAIL_BLOCKLIST.test(v)) return false;
  if (!EMAIL_RE.test(v)) return false;
  const tld = v.split(".").pop() || "";
  return tld.length >= 2;
};

/**
 * True when the address is well-formed but deliberately refused by the
 * blocklist. These two cases need different messages: telling someone their
 * address is "invalid" when it is a real, deliverable mailbox (admin@ is a
 * normal business address) reads as a broken form, and they leave.
 */
export const isBlockedEmail = (raw: string) => {
  const v = raw.trim();
  if (!v) return false;
  return EMAIL_BLOCKLIST.test(v) && EMAIL_RE.test(v);
};

interface Props {
  courseType: CourseType | "";
  name: string;
  phone: string;
  email: string;
  message: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onMessageChange: (v: string) => void;
  /**
   * Reveal validation errors even on fields the visitor never blurred.
   * Submit sets this: a field that was never focused can still be the reason
   * the form was rejected, and until now that error was invisible.
   */
  showErrors?: boolean;
}

const LeadFields = ({
  courseType,
  name,
  phone,
  email,
  message,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onMessageChange,
  showErrors = false,
}: Props) => {
  const { t } = useI18n();
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const phoneError = (phoneTouched || showErrors) && !isValidPhone(phone);
  const emailError = (emailTouched || showErrors) && Boolean(email) && !isValidEmail(email);

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">
            {courseType === "kids" ? t.kidsParentName : t.labelName} *
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t.placeholderName}
            required
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t.labelPhone} *</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            onBlur={() => setPhoneTouched(true)}
            placeholder={t.placeholderPhone}
            required
            maxLength={30}
            aria-invalid={phoneError || undefined}
            className={phoneError ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {phoneError && (
            <p className="text-xs text-destructive">{t.validPhoneError}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t.labelEmail}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder={t.placeholderEmail}
            maxLength={255}
            aria-invalid={emailError || undefined}
            className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {emailError && (
            <p className="text-xs text-destructive">{t.validEmailError}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t.mainLeadMessageLabel}</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={t.mainLeadMessagePlaceholder}
          rows={3}
          maxLength={1000}
        />
      </div>
    </>
  );
};

export default LeadFields;