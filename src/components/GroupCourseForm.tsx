import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import GdprCheckbox from "@/components/GdprCheckbox";
import { trackFormSubmit } from "@/lib/tracking";
import { z } from "zod";

const mainLeadSchema = z.object({
  courseType: z.enum(["group", "private", "kids"]),
  format: z.enum(["fizic", "online"]),
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value.replace(/[\u00A0\u2007\u202F]/g, " ").replace(/\s+/g, " "))
    .refine((value) => value.replace(/\D/g, "").length >= 7, "Phone number is too short")
    .refine((value) => value.replace(/\D/g, "").length <= 15, "Phone number is too long")
    .refine((value) => /^[+\d\s().\-/]+$/.test(value), "Phone number contains unsupported characters"),
  email: z.string().trim().email().max(255),
  message: z.string().trim().max(1000).optional(),
}).refine((data) => data.courseType !== "kids" || data.format === "fizic", {
  path: ["format"],
  message: "Kids courses are physical only",
});

const templateByCourseType = {
  group: "group-registration-confirmation",
  private: "private-registration-confirmation",
  kids: "kids-registration-confirmation",
} as const;

const GroupCourseForm = () => {
  const { t } = useI18n();
  const [courseType, setCourseType] = useState<"group" | "private" | "kids">("group");
  const [format, setFormat] = useState<"fizic" | "online">("fizic");
  const [submitting, setSubmitting] = useState(false);
  const [gdpr, setGdpr] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (courseType === "kids") setFormat("fizic");
  }, [courseType]);

  useEffect(() => {
    const context = { courseType, format };
    window.localStorage.setItem("lead-contact-context", JSON.stringify(context));
    window.dispatchEvent(new CustomEvent("lead-contact-context-change", { detail: context }));
  }, [courseType, format]);

  const details = [
    { label: t.mainLeadDetailGroupLabel, value: t.mainLeadDetailGroupValue },
    { label: t.mainLeadDetailPrivateLabel, value: t.mainLeadDetailPrivateValue },
    { label: t.mainLeadDetailKidsLabel, value: t.mainLeadDetailKidsValue },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gdpr) {
      toast.error(t.gdprRequired);
      return;
    }

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const parsed = mainLeadSchema.safeParse({
      courseType,
      format,
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      message: formData.get("message") || undefined,
    });

    if (!parsed.success) {
      toast.error(t.mainLeadValidationError);
      setSubmitting(false);
      return;
    }

    const registration = parsed.data;
    const center = registration.format === "fizic" ? "bucuresti" : "online";
    const courseLabel =
      registration.courseType === "group"
        ? t.mainLeadCourseGroup
        : registration.courseType === "private"
          ? t.mainLeadCoursePrivate
          : t.mainLeadCourseKids;

    const notes = [
      `Course type: ${registration.courseType}`,
      `Requested callback: yes`,
      registration.message ? `Message: ${registration.message}` : undefined,
    ].filter(Boolean).join("\n");

    const { data: inserted, error } = await supabase
      .from("registrations")
      .insert({
        form_type: registration.courseType,
        name: registration.name,
        phone: registration.phone,
        email: registration.email,
        center,
        format: registration.format,
        notes,
      })
      .select("id")
      .single();

    if (error) {
      toast.error(t.mainLeadError);
      console.error("Registration error:", error);
    } else {
      toast.success(t.mainLeadSuccess);
      trackFormSubmit(registration.courseType);

      supabase.functions.invoke("notify-registration", {
        body: {
          name: registration.name,
          phone: registration.phone,
          email: registration.email,
          form_type: registration.courseType,
          center,
          format: registration.format,
          notes: `${courseLabel}; ${notes}`,
        },
      }).catch(console.error);

      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: templateByCourseType[registration.courseType],
          recipientEmail: registration.email,
          idempotencyKey: `reg-confirm-${registration.courseType}-${inserted?.id ?? Date.now()}`,
          templateData: {
            name: registration.name,
            format: registration.format,
            center,
            message: registration.message,
          },
        },
      }).catch(console.error);

      (e.target as HTMLFormElement).reset();
      setCourseType("group");
      setFormat("fizic");
      setGdpr(false);
      setSubmitted(true);
    }

    setSubmitting(false);
  };

  return (
    <section id="inscriere" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground font-medium text-center mb-4">—</p>
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-3 tracking-tight">{t.mainLeadTitle}</h2>
        <p className="text-muted-foreground text-center mb-16 max-w-md mx-auto text-sm">{t.mainLeadDesc}</p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-8">{t.groupDetails}</h3>
            <div className="space-y-6">
              {details.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[13px] font-semibold text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 py-3 px-4 border-l-2 border-primary/30">
              <p className="text-sm text-muted-foreground">{t.mainLeadCallbackNote}</p>
            </div>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">{t.mainLeadSuccessTitle}</h3>
              <p className="text-sm text-muted-foreground">{t.mainLeadSuccessDesc}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground mb-2">{t.groupFormTitle}</h3>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">{t.mainLeadCourseTypeLabel} *</Label>
                <Select value={courseType} onValueChange={(value) => setCourseType(value as "group" | "private" | "kids")}>
                  <SelectTrigger className="h-11 border-border bg-background">
                    <SelectValue placeholder={t.mainLeadCourseTypePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group">{t.mainLeadCourseGroup}</SelectItem>
                    <SelectItem value="private">{t.mainLeadCoursePrivate}</SelectItem>
                    <SelectItem value="kids">{t.mainLeadCourseKids}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-medium">{t.groupFormatLabel} *</Label>
                <RadioGroup value={format} onValueChange={(value) => setFormat(value as "fizic" | "online")} className="flex gap-6 pt-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="fizic" id="main-fizic" />
                    <Label htmlFor="main-fizic" className="cursor-pointer font-normal text-sm">{t.groupPhysical}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="online" id="main-online" disabled={courseType === "kids"} />
                    <Label htmlFor="main-online" className="cursor-pointer font-normal text-sm data-[disabled=true]:opacity-50">{t.groupOnline}</Label>
                  </div>
                </RadioGroup>
                {courseType === "kids" && <p className="text-xs text-muted-foreground">{t.kidsPhysicalOnly}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="main-name" className="text-[13px] font-medium">{t.labelName} *</Label>
                <Input id="main-name" name="name" required maxLength={100} placeholder={t.placeholderName} className="h-11 border-border bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="main-phone" className="text-[13px] font-medium">{t.labelPhone} *</Label>
                <Input id="main-phone" name="phone" type="tel" required maxLength={40} placeholder={t.placeholderPhone} className="h-11 border-border bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="main-email" className="text-[13px] font-medium">{t.labelEmail} *</Label>
                <Input id="main-email" name="email" type="email" required maxLength={255} placeholder={t.placeholderEmail} className="h-11 border-border bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="main-message" className="text-[13px] font-medium">{t.mainLeadMessageLabel}</Label>
                <Textarea id="main-message" name="message" maxLength={1000} placeholder={t.mainLeadMessagePlaceholder} className="min-h-24 resize-none border-border bg-background" />
              </div>
              <GdprCheckbox checked={gdpr} onCheckedChange={setGdpr} />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-sm font-semibold tracking-wide bg-foreground text-background rounded-full transition-all hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? t.groupSubmitting : t.mainLeadSubmit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default GroupCourseForm;
