import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import GdprCheckbox from "@/components/GdprCheckbox";
import PaymentInstructions from "@/components/PaymentInstructions";
import { trackFormSubmit } from "@/lib/tracking";
import { z } from "zod";

const privateRegistrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20).regex(/^[+\d\s().-]+$/),
  email: z.string().trim().email().max(255),
  format: z.enum(["fizic", "online"]),
  message: z.string().trim().max(1000).optional(),
});

const PrivateLessonsForm = () => {
  const { t } = useI18n();
  const [format, setFormat] = useState("fizic");
  const [submitting, setSubmitting] = useState(false);
  const [gdpr, setGdpr] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | undefined>();
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gdpr) {
      toast.error(t.gdprRequired);
      return;
    }
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const parsed = privateRegistrationSchema.safeParse({
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      format,
      message: formData.get("message") || undefined,
    });

    if (!parsed.success) {
      toast.error("Verifică numele, emailul, telefonul și opțiunile selectate.");
      setSubmitting(false);
      return;
    }

    const registration = parsed.data;

    const { data: inserted, error } = await supabase
      .from("registrations")
      .insert({
        form_type: "private",
        name: registration.name,
        phone: registration.phone,
        email: registration.email,
        center: registration.format === "fizic" ? "bucuresti" : "online",
        format: registration.format,
        notes: registration.message
          ? `Private lesson format: ${registration.format}\nMessage: ${registration.message}`
          : `Private lesson format: ${registration.format}`,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("A apărut o eroare. Încercați din nou.");
      console.error("Registration error:", error);
    } else {
      toast.success(t.privateSuccess);
      trackFormSubmit("private");
      supabase.functions.invoke("notify-registration", {
        body: { name: registration.name, phone: registration.phone, email: registration.email, form_type: "private", center: registration.format === "fizic" ? "bucuresti" : "online", format: registration.format, notes: registration.message },
      }).catch(console.error);
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "registration-confirmation",
          recipientEmail: registration.email,
          idempotencyKey: `reg-confirm-private-${inserted?.id ?? Date.now()}`,
          templateData: { name: registration.name, formType: "private", format: registration.format, message: registration.message },
        },
      }).catch(console.error);
      (e.target as HTMLFormElement).reset();
      setFormat("fizic");
      setGdpr(false);
      setRegistrationId(inserted?.id);
      setStudentEmail(registration.email);
      setStudentName(registration.name);
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <section id="private" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t.privateTitle}</h2>
          <p className="text-muted-foreground text-sm">{t.privateDesc}</p>
        </div>

        {submitted ? (
          <PaymentInstructions registrationId={registrationId} email={studentEmail} name={studentName} />
        ) : (
          <form onSubmit={handleSubmit} className="bg-background rounded-2xl border border-border p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="priv-name" className="text-sm">{t.labelName} *</Label>
              <Input id="priv-name" name="name" required maxLength={100} placeholder={t.placeholderName} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priv-phone" className="text-sm">{t.labelPhone} *</Label>
              <Input id="priv-phone" name="phone" type="tel" required maxLength={20} placeholder={t.placeholderPhone} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priv-email" className="text-sm">{t.labelEmail} *</Label>
              <Input id="priv-email" name="email" type="email" required maxLength={255} placeholder={t.placeholderEmail} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t.labelFormat} *</Label>
              <RadioGroup value={format} onValueChange={setFormat} className="flex gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fizic" id="priv-fizic" />
                  <Label htmlFor="priv-fizic" className="cursor-pointer text-sm font-normal">{t.privateFormatPhysical}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="online" id="priv-online" />
                  <Label htmlFor="priv-online" className="cursor-pointer text-sm font-normal">{t.privateFormatOnline}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priv-message" className="text-sm">Mesaj opțional</Label>
              <Textarea
                id="priv-message"
                name="message"
                maxLength={1000}
                placeholder="Subiecte preferate, disponibilitate sau alte detalii"
                className="min-h-24 resize-none"
              />
            </div>
            <GdprCheckbox checked={gdpr} onCheckedChange={setGdpr} />
            <button type="submit" disabled={submitting} className="w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90 disabled:opacity-50">
              {submitting ? t.privateSubmitting : t.privateSubmit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default PrivateLessonsForm;
