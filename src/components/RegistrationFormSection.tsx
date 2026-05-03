import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GdprCheckbox from "@/components/GdprCheckbox";
import PaymentInstructions from "@/components/PaymentInstructions";
import { toast } from "sonner";
import { CheckCircle2, Loader2, MessageCircle, RotateCcw, Phone, CreditCard } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

const WHATSAPP_URL = "https://wa.me/40763124514";

type CourseType = "group" | "private" | "kids";
type FormatType = "fizic" | "online";
type LevelType = "A1" | "A2" | "B1" | "B2";

const TEMPLATE_BY_COURSE: Record<CourseType, string> = {
  group: "group-registration-confirmation",
  private: "private-registration-confirmation",
  kids: "kids-registration-confirmation",
};

const RegistrationFormSection = () => {
  const { t } = useI18n();

  const [courseType, setCourseType] = useState<CourseType | "">("");
  const [format, setFormat] = useState<FormatType | "">("");
  const [level, setLevel] = useState<LevelType | "">("A1");
  const [center, setCenter] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [message, setMessage] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [privateQuantity, setPrivateQuantity] = useState<number>(1);
  const [submittedData, setSubmittedData] = useState<{
    courseType: CourseType;
    email: string;
    name: string;
    registrationId: string;
    quantity?: number;
  } | null>(null);

  const onCourseChange = (value: CourseType) => {
    setCourseType(value);
    if (value === "kids") {
      setFormat("fizic");
    } else {
      setFormat("");
    }
    setCenter("");
    if (value !== "private") setPrivateQuantity(1);
  };

  const reset = () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseType) {
      toast.error(t.mainLeadErrorCourseType);
      return;
    }
    if (!format) {
      toast.error(
        courseType === "kids" ? t.mainLeadErrorKidsFormat : t.mainLeadErrorFormat,
      );
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
      const id = crypto.randomUUID();
      const formType = courseType; // DB check constraint requires 'group' | 'private' | 'kids'
      const formTypeLabel =
        courseType === "group" ? "Grup" : courseType === "private" ? "Privat" : "Copii";

      const notesParts: string[] = [];
      if (courseType === "group" && level) notesParts.push(`Nivel: ${level}`);
      if (courseType === "private") {
        notesParts.push(`Lecții: ${privateQuantity}${privateQuantity >= 20 ? " (−15% auto)" : ""}`);
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
      });

      if (error) throw error;

      // Fire-and-forget admin notification + confirmation email
      void supabase.functions.invoke("notify-registration", {
        body: {
          name: recipientName,
          phone,
          email,
          form_type: formTypeLabel,
          center,
          format,
          notes,
        },
      });

      if (email) {
        void supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: TEMPLATE_BY_COURSE[courseType],
            recipientEmail: email,
            idempotencyKey: `reg-${id}`,
            templateData: { name: recipientName },
          },
        });
      }

      trackEvent("Lead", { content_name: formTypeLabel });
      toast.success(t.mainLeadSuccess);
      setSubmittedData({
        courseType: courseType as CourseType,
        email: email || "",
        name: recipientName,
        registrationId: id,
        quantity: courseType === "private" ? privateQuantity : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Registration error", err);
      toast.error(t.mainLeadError);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const isPayable = submittedData && submittedData.courseType !== "kids";
    return (
      <section id="inscriere" className="py-20 px-6 scroll-mt-24">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Confirmation header */}
          <div className="bg-background rounded-2xl border border-border p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-foreground">
                  {t.mainLeadSuccessTitle}
                </h2>
                <p className="text-muted-foreground mt-1">{t.mainLeadSuccessDesc}</p>
              </div>
            </div>

            {/* Next steps */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {t.successNextStepsTitle}
              </h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-foreground">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-xs font-semibold flex items-center justify-center text-foreground">
                    1
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {t.successStepConfirm}
                  </span>
                </li>
                {isPayable && (
                  <li className="flex items-start gap-3 text-sm text-foreground">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-xs font-semibold flex items-center justify-center text-primary">
                      2
                    </span>
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      {t.successStepPay}
                    </span>
                  </li>
                )}
              </ol>
            </div>
          </div>

          {/* Payment card (primary action) */}
          {isPayable && submittedData && (
            <PaymentInstructions
              courseType={submittedData.courseType as "group" | "private"}
              email={submittedData.email}
              name={submittedData.name}
              registrationId={submittedData.registrationId}
              quantity={submittedData.quantity}
            />
          )}

          {/* Utility actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              WhatsApp
            </a>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t.successAgain}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inscriere" className="py-20 px-6 scroll-mt-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            {t.mainLeadTitle}
          </h2>
          <p className="text-muted-foreground">{t.mainLeadDesc}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-background rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-5"
        >
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

          {/* Level (group only) */}
          {courseType === "group" && (
            <div className="space-y-2">
              <Label htmlFor="level">{t.mainLeadLevelLabel} *</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as LevelType)}>
                <SelectTrigger id="level">
                  <SelectValue placeholder={t.mainLeadLevelPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1 — {t.levelA1Subtitle}</SelectItem>
                  <SelectItem value="A2">A2 — {t.levelA2Subtitle}</SelectItem>
                  <SelectItem value="B1">B1 — {t.levelB1Subtitle}</SelectItem>
                  <SelectItem value="B2">B2 — {t.levelB2Subtitle}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t.mainLeadLevelHelp}</p>
            </div>
          )}

          {/* Private lessons quantity */}
          {courseType === "private" && (
            <div className="space-y-2">
              <Label htmlFor="privateQuantity">{t.privateQuantityLabel} *</Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrivateQuantity((q) => Math.max(1, q - 1))}
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
                    setPrivateQuantity(Number.isFinite(n) ? Math.min(100, Math.max(1, n)) : 1);
                  }}
                  className="text-center font-semibold w-20"
                />
                <button
                  type="button"
                  onClick={() => setPrivateQuantity((q) => Math.min(100, q + 1))}
                  className="w-10 h-10 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-lg font-semibold"
                  aria-label="+"
                >
                  +
                </button>
                <div className="ml-auto text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {(privateQuantity * 150 * (privateQuantity >= 20 ? 0.85 : 1)).toLocaleString("ro-RO")} LEI
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
                  <SelectItem value="Bucuresti - Nord">
                    {t.mainLeadLocationBucharestNord}
                  </SelectItem>
                  <SelectItem value="Bucuresti - Sud">
                    {t.mainLeadLocationBucharestSud}
                  </SelectItem>
                  <SelectItem value="Alt oras">
                    {t.mainLeadLocationOtherCity}
                  </SelectItem>
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

          {/* Kids extra */}
          {courseType === "kids" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="childName">{t.kidsChildName} *</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
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
                  onChange={(e) => setChildAge(e.target.value)}
                  placeholder={t.kidsChildAgePlaceholder}
                  required
                  maxLength={20}
                />
              </div>
            </div>
          )}

          {/* Contact details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">
                {courseType === "kids" ? t.kidsParentName : t.labelName} *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.placeholderPhone}
                required
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.labelEmail}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholderEmail}
                maxLength={255}
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">{t.mainLeadMessageLabel}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.mainLeadMessagePlaceholder}
              rows={3}
              maxLength={1000}
            />
          </div>

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
      </div>
    </section>
  );
};

export default RegistrationFormSection;