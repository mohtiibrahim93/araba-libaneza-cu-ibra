import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import GdprCheckbox from "@/components/GdprCheckbox";
import PaymentInstructions from "@/components/PaymentInstructions";
import { trackFormSubmit } from "@/lib/tracking";
import { z } from "zod";

const kidsRegistrationSchema = z.object({
  parentName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20).regex(/^[+\d\s().-]+$/),
  email: z.string().trim().email().max(255),
  childName: z.string().trim().min(2).max(100),
  childAge: z.string().trim().min(1).max(20),
  notes: z.string().trim().max(500).optional(),
});

const KidsCourseForm = () => {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [gdpr, setGdpr] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gdpr) {
      toast.error(t.gdprRequired);
      return;
    }
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const parsed = kidsRegistrationSchema.safeParse({
      parentName: formData.get("parentName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      childName: formData.get("childName"),
      childAge: formData.get("childAge"),
      notes: formData.get("notes"),
    });

    if (!parsed.success) {
      toast.error("Verifică datele părintelui și detaliile copilului.");
      setSubmitting(false);
      return;
    }

    const registration = parsed.data;

    const { data: inserted, error } = await supabase
      .from("registrations")
      .insert({
        form_type: "kids",
        name: registration.parentName,
        phone: registration.phone,
        email: registration.email,
        center: "bucuresti",
        format: "fizic",
        child_age: registration.childAge,
        notes: `Child: ${registration.childName}; Format: fizic; ${registration.notes || ""}`.trim(),
      })
      .select("id")
      .single();

    if (error) {
      toast.error("A apărut o eroare. Încercați din nou.");
      console.error("Registration error:", error);
    } else {
      toast.success(t.kidsSuccess);
      trackFormSubmit("kids");
      supabase.functions.invoke("notify-registration", {
        body: { name: registration.parentName, phone: registration.phone, email: registration.email, form_type: "kids", center: "bucuresti", format: "fizic", notes: `Child: ${registration.childName}; Age: ${registration.childAge}` },
      }).catch(console.error);
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "registration-confirmation",
          recipientEmail: registration.email,
          idempotencyKey: `reg-confirm-kids-${inserted?.id ?? Date.now()}`,
          templateData: {
            name: registration.parentName,
            formType: "kids",
            childName: registration.childName,
            childAge: registration.childAge,
            message: registration.notes,
          },
        },
      }).catch(console.error);
      (e.target as HTMLFormElement).reset();
      setGdpr(false);
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <section id="kids" className="py-20 px-6 scroll-mt-20">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t.kidsTitle}</h2>
          <p className="text-muted-foreground text-sm">{t.kidsDesc}</p>
        </div>

        {submitted ? (
           <PaymentInstructions />
        ) : (
          <form onSubmit={handleSubmit} className="bg-background rounded-2xl border border-border p-6 space-y-4">
            <div className="bg-primary/10 text-primary text-sm font-medium rounded-lg px-4 py-3">
              {t.kidsAlready}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kid-parent" className="text-sm">{t.kidsParentName} *</Label>
              <Input id="kid-parent" name="parentName" required maxLength={100} placeholder={t.placeholderName} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kid-phone" className="text-sm">{t.labelPhone} *</Label>
              <Input id="kid-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kid-email" className="text-sm">{t.labelEmail}</Label>
              <Input id="kid-email" name="email" type="email" required maxLength={255} placeholder={t.placeholderEmail} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kid-name" className="text-sm">{t.kidsChildName} *</Label>
              <Input id="kid-name" name="childName" required maxLength={100} placeholder={t.kidsChildNamePlaceholder} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kid-age" className="text-sm">{t.kidsChildAge} *</Label>
              <Input id="kid-age" name="childAge" required maxLength={20} placeholder={t.kidsChildAgePlaceholder} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kid-notes" className="text-sm">{t.kidsNotes}</Label>
              <Textarea id="kid-notes" name="notes" maxLength={500} placeholder={t.kidsNotesPlaceholder} rows={3} />
            </div>
            <p className="text-xs text-muted-foreground">📍 {t.kidsPhysicalOnly}</p>
            <GdprCheckbox checked={gdpr} onCheckedChange={setGdpr} />
            <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90 disabled:opacity-50">
              {submitting ? t.kidsSubmitting : t.kidsSubmit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default KidsCourseForm;
