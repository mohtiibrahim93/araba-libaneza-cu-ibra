import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GdprCheckbox from "@/components/GdprCheckbox";
import { useGroupCapacities } from "@/hooks/useGroupCapacity";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { getRecaptchaToken } from "@/lib/recaptcha";
import TrustBand from "@/components/TrustBand";

import GroupFields from "./RegistrationForm/GroupFields";
import PrivateFields from "./RegistrationForm/PrivateFields";
import KidsFields from "./RegistrationForm/KidsFields";
import LeadFields from "./RegistrationForm/LeadFields";
import CapacityBanner from "./RegistrationForm/CapacityBanner";
import PostSubmitView from "./RegistrationForm/PostSubmitView";
import type { CourseType, FormatType, LevelType, SubmittedData } from "./RegistrationForm/types";

const WHATSAPP_URL = "https://wa.me/40763124514";

interface RegistrationFormSectionProps {
  defaultCourseType?: CourseType;
  embedded?: boolean;
  onBack?: () => void;
}

const STORAGE_KEY = "registration_form_draft";

const RegistrationFormSection = ({
  defaultCourseType,
  embedded = false,
  onBack,
}: RegistrationFormSectionProps = {}) => {
  const { t } = useI18n();
  const { get: getCapacity } = useGroupCapacities();

  const [courseType, setCourseType] = useState<CourseType | "">(defaultCourseType ?? "");
  const [format, setFormat] = useState<FormatType | "">(
    defaultCourseType === "kids" ? "online" : "",
  );
  const [level, setLevel] = useState<LevelType | "">("A1");
  const [center, setCenter] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [message, setMessage] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [privateQuantity, setPrivateQuantity] = useState<number>(1);
  const [groupMonths, setGroupMonths] = useState<1 | 3>(1);
  const [payDeposit, setPayDeposit] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);
  const [honeypot, setHoneypot] = useState("");

  /* Restore draft from sessionStorage on mount */
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      if (draft.courseType) setCourseType(draft.courseType);
      if (draft.format !== undefined) setFormat(draft.format);
      if (draft.level) setLevel(draft.level);
      if (draft.center !== undefined) setCenter(draft.center);
      if (draft.name !== undefined) setName(draft.name);
      if (draft.phone !== undefined) setPhone(draft.phone);
      if (draft.email !== undefined) setEmail(draft.email);
      if (draft.childName !== undefined) setChildName(draft.childName);
      if (draft.childAge !== undefined) setChildAge(draft.childAge);
      if (draft.message !== undefined) setMessage(draft.message);
      if (draft.gdpr !== undefined) setGdpr(draft.gdpr);
      if (draft.referralCode !== undefined) setReferralCode(draft.referralCode);
      if (draft.privateQuantity !== undefined) setPrivateQuantity(draft.privateQuantity);
      if (draft.groupMonths !== undefined) setGroupMonths(draft.groupMonths);
      if (draft.payDeposit !== undefined) setPayDeposit(draft.payDeposit);
    } catch {
      // ignore corrupted drafts
    }
  }, []);

  /* Save draft to sessionStorage on every field change */
  useEffect(() => {
    if (submitted) return;
    const draft = {
      courseType,
      format,
      level,
      center,
      name,
      phone,
      email,
      childName,
      childAge,
      message,
      gdpr,
      referralCode,
      privateQuantity,
      groupMonths,
      payDeposit,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [
    courseType, format, level, center, name, phone, email,
    childName, childAge, message, gdpr,
    referralCode, privateQuantity, groupMonths, payDeposit, submitted,
  ]);

  const onCourseChange = (value: CourseType) => {
    setCourseType(value);
    if (value === "kids") {
      setFormat("online");
    } else {
      setFormat("");
    }
    setCenter("");
    setPayDeposit(false);
    if (value !== "private") setPrivateQuantity(1);
    if (value !== "group") setGroupMonths(1);
  };

  const reset = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setCourseType("");
    setFormat("");
    setLevel("A1");
    setCenter("");
    setName("");
    setPhone("");
    setEmail("");
    setChildName("");
    setChildAge("");
    setMessage("");
    setGdpr(false);
    setSubmitted(false);
    setPrivateQuantity(1);
    setGroupMonths(1);
    setPayDeposit(false);
  };

  const capacity =
    courseType === "group"
      ? getCapacity("group", level || null)
      : courseType === "kids"
        ? getCapacity("kids", null)
        : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot: silently drop bot submissions
    if (honeypot) {
      setSubmitted(true);
      return;
    }

    if (!courseType) {
      toast.error(t.mainLeadErrorCourseType);
      return;
    }
    if (!format) {
      toast.error(courseType === "kids" ? t.mainLeadErrorKidsFormat : t.mainLeadErrorFormat);
      return;
    }
    if (courseType === "group" && !level) {
      toast.error(t.mainLeadErrorLevel);
      return;
    }
    if (format === "fizic" && !center) {
      toast.error(t.mainLeadErrorLocation);
      return;
    }
    if (!gdpr) {
      toast.error(t.gdprRequired);
      return;
    }

    setSubmitting(true);
    try {
      // reCAPTCHA v3 verification (soft — skip if unavailable on this domain).
      const recaptchaToken = await getRecaptchaToken("registration");
      if (recaptchaToken) {
        const { data: verify, error: verifyErr } = await supabase.functions.invoke(
          "verify-recaptcha",
          { body: { token: recaptchaToken } },
        );
        if (verifyErr) {
          console.warn("[registration] recaptcha verify error, proceeding", verifyErr);
        } else if (verify && verify.success === false) {
          toast.error(t.recaptchaFailed);
          setSubmitting(false);
          return;
        }
      } else {
        console.warn("[registration] no recaptcha token — proceeding without verification");
      }

      const id = crypto.randomUUID();
      const formType = courseType;
      const formTypeLabel =
        courseType === "group" ? "Grup" : courseType === "private" ? "Privat" : "Copii";

      const notesParts: string[] = [];
      if (courseType === "group" && level) notesParts.push(`Nivel: ${level}`);
      if (courseType === "private") {
        notesParts.push(
          `Lecții: ${privateQuantity}${privateQuantity >= 20 ? " (−15% auto)" : ""}`,
        );
        // Default flow: first lesson is a free trial (handled post-submit).
        notesParts.push(`Probă gratuită: da (default)`);
      }
      if (courseType === "group") {
        notesParts.push(
          `Plată: ${groupMonths} lun${groupMonths === 1 ? "ă" : "i"}${
            groupMonths >= 3 ? " (−10% auto)" : ""
          }`,
        );
      }
      if (courseType === "kids") {
        if (childName) notesParts.push(`Copil: ${childName}`);
        if (childAge) notesParts.push(`Vârstă: ${childAge}`);
      }
      if (message) notesParts.push(`Message: ${message}`);
      const notes = notesParts.join(" | ") || null;

      const recipientName = courseType === "kids" && childName ? childName : name;

      const { error } = await supabase.from("registrations").insert({
        id,
        form_type: formType,
        name: recipientName,
        phone,
        email: email || null,
        center: center || null,
        format,
        notes,
        child_age: courseType === "kids" ? childAge || null : null,
        level: courseType === "group" ? level || null : null,
        is_waitlist_deposit: courseType === "kids" && payDeposit,
        referral_code: referralCode.trim() || null,
      });

      if (error) throw error;

      void supabase.functions.invoke("notify-registration", {
        body: { registrationId: id },
      });

      trackEvent("Lead", { content_name: formTypeLabel });
      toast.success(t.mainLeadSuccess);
      setSubmittedData({
        courseType: courseType as CourseType,
        email: email || "",
        name: recipientName,
        registrationId: id,
        quantity:
          courseType === "private"
            ? privateQuantity
            : courseType === "group"
              ? groupMonths
              : undefined,
        waitlistDeposit: courseType === "kids" && payDeposit,
      });
      setSubmitted(true);
      sessionStorage.removeItem(STORAGE_KEY);

      if (courseType === "kids" && payDeposit) {
        try {
          const { data: ck, error: ckErr } = await supabase.functions.invoke("create-checkout", {
            body: { courseType: "kids_deposit", email, name: recipientName, registrationId: id },
          });
          if (ckErr) throw ckErr;
          if (ck?.url) {
            toast.info(t.kidsWaitlistRedirect);
            window.location.href = ck.url;
          }
        } catch (err) {
          console.error("Kids deposit checkout failed", err);
          toast.error(t.mainLeadError);
        }
      }
    } catch (err) {
      console.error("Registration error", err);
      toast.error(t.mainLeadError);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && submittedData) {
    return <PostSubmitView data={submittedData} embedded={embedded} onReset={reset} />;
  }

  return (
    <section
      id={embedded ? undefined : "inscriere"}
      className={embedded ? "" : "py-20 px-6 scroll-mt-24"}
    >
      <div className={embedded ? "" : "max-w-2xl mx-auto"}>
        {!embedded && (
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              {t.mainLeadTitle}
            </h2>
            <p className="text-muted-foreground">{t.mainLeadDesc}</p>
          </div>
        )}
        {embedded && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {t.navCourses}
          </button>
        )}

        <form
          onSubmit={handleSubmit}
          className={
            embedded
              ? "space-y-5"
              : "bg-background rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-5"
          }
        >
          {/* Honeypot — hidden from real users, attractive to bots */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: "none" }}
          />

          {/* Course type */}
          <div className="space-y-2">
            <Label htmlFor="courseType">{t.mainLeadCourseTypeLabel} *</Label>
            <Select value={courseType} onValueChange={(v) => onCourseChange(v as CourseType)}>
              <SelectTrigger id="courseType">
                <SelectValue placeholder={t.mainLeadCourseTypePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group">{t.mainLeadCourseGroup}</SelectItem>
                <SelectItem value="private">{t.mainLeadCoursePrivate}</SelectItem>
                <SelectItem value="kids">{t.mainLeadCourseKids}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          {courseType && (
            <div className="space-y-2">
              <Label htmlFor="format">{t.labelFormat} *</Label>
              {courseType === "kids" ? (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 border border-border">
                  {t.kidsPhysicalOnly}
                </p>
              ) : (
                <Select value={format} onValueChange={(v) => setFormat(v as FormatType)}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder={t.labelFormat} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fizic">{t.privateFormatPhysical}</SelectItem>
                    <SelectItem value="online">{t.privateFormatOnline}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Group: level + months */}
          {courseType === "group" && (
            <GroupFields
              level={level}
              onLevelChange={setLevel}
              groupMonths={groupMonths}
              onGroupMonthsChange={setGroupMonths}
            />
          )}

          {/* Private: quantity */}
          {courseType === "private" && (
            <PrivateFields
              privateQuantity={privateQuantity}
              onPrivateQuantityChange={setPrivateQuantity}
            />
          )}

          {/* Center for physical */}
          {format === "fizic" && (
            <div className="space-y-2">
              <Label htmlFor="center">{t.mainLeadLocationLabel} *</Label>
              <Select value={center} onValueChange={setCenter}>
                <SelectTrigger id="center">
                  <SelectValue placeholder={t.mainLeadLocationPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bucuresti - Centru (Raduga)">
                    {t.mainLeadLocationBucharestCentru}
                  </SelectItem>
                  <SelectItem value="Bucuresti - Nord">{t.mainLeadLocationBucharestNord}</SelectItem>
                  <SelectItem value="Bucuresti - Sud">{t.mainLeadLocationBucharestSud}</SelectItem>
                  <SelectItem value="Alt oras">{t.mainLeadLocationOtherCity}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t.mainLeadLocationHelp}</p>
            </div>
          )}

          {/* Online info */}
          {format === "online" && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{t.mainLeadOnlineInfoTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.mainLeadOnlineInfoDesc}</p>
            </div>
          )}

          {/* Capacity banner: group + kids */}
          {capacity && (courseType === "group" || courseType === "kids") && (
            <CapacityBanner capacity={capacity} />
          )}

          {/* Kids: child fields + (conditional) waitlist deposit */}
          {courseType === "kids" && (
            <KidsFields
              childName={childName}
              childAge={childAge}
              payDeposit={payDeposit}
              capacity={capacity}
              onChildNameChange={setChildName}
              onChildAgeChange={setChildAge}
              onPayDepositChange={setPayDeposit}
            />
          )}

          {/* Contact + message */}
          <LeadFields
            courseType={courseType}
            name={name}
            phone={phone}
            email={email}
            message={message}
            onNameChange={setName}
            onPhoneChange={setPhone}
            onEmailChange={setEmail}
            onMessageChange={setMessage}
          />

          {/* Trial UX (Option A): no toggle here. Private students are
              defaulted into the free trial flow post-submit, with a
              subtle "pay directly" link below the booking embed. */}

          <p className="text-xs text-muted-foreground">{t.mainLeadCallbackNote}</p>

          <GdprCheckbox checked={gdpr} onCheckedChange={setGdpr} />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t.groupSubmitting}
              </>
            ) : (
              t.mainLeadSubmit
            )}
          </Button>

          <div className="text-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t.ctaButton}
            </a>
          </div>
        </form>

        {!submitted && <TrustBand />}
      </div>
    </section>
  );
};

export default RegistrationFormSection;
