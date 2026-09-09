import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2, BellRing, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import GdprCheckbox from "@/components/GdprCheckbox";
import { isValidEmail, isValidPhone } from "@/components/RegistrationForm/LeadFields";
import {
  trackGenerateLead,
} from "@/lib/tracking";

interface NotifyMeFormProps {
  /** What the person is asking to be notified about — stored so the admin
   *  knows which group/level the request is for (e.g. "Grupă tineri 11–17"). */
  context: string;
  /** Optional level hint stored on the request row (A1…C2). */
  level?: string;
  className?: string;
}

/**
 * "Anunță-mă când pornește grupa" — captures interest for a group that isn't
 * scheduled yet. Writes to public.course_requests (anon INSERT policy,
 * status='new'), so requests land in the admin instead of a WhatsApp thread.
 */
const NotifyMeForm = ({ context, level, className }: NotifyMeFormProps) => {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [format, setFormat] = useState<"online" | "fizic" | "">("");
  const [gdpr, setGdpr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error(t.schedulerNameRequired);
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error(t.validPhoneError);
      return;
    }
    if (email.trim() && !isValidEmail(email)) {
      toast.error(t.validEmailError);
      return;
    }
    if (!gdpr) {
      toast.error(t.bookingGdprRequired);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("course_requests").insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        level: level || null,
        format: format || null,
        preferred_language: lang,
        lesson_type: "group",
        status: "new", // required by the anon INSERT policy
        notes: `Cerere „anunță-mă”: ${context}`,
      });
      if (error) throw error;
      trackGenerateLead("notify_me", { context });
      setSent(true);
    } catch (err) {
      console.error("[notify-me] insert failed", err);
      toast.error(t.schedulerBookingFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className={`rounded-2xl border border-border bg-card p-6 text-center space-y-3 ${className ?? ""}`}>
        <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
        <h3 className="font-display text-lg font-bold text-foreground">
          {lang === "en" ? "You're on the list!" : "Ești pe listă!"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {lang === "en"
            ? "We'll contact you the moment this group starts. No spam."
            : "Te contactăm în momentul în care pornește grupa. Fără spam."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <BellRing className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {lang === "en" ? "Notify me when it starts" : "Anunță-mă când pornește"}
          </h3>
          <p className="text-sm text-muted-foreground">{context}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="nm-name">{t.labelName} *</Label>
          <Input id="nm-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nm-phone">{t.labelPhone} *</Label>
          <Input id="nm-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={30} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nm-email">{t.labelEmail}</Label>
          <Input id="nm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nm-format">{lang === "en" ? "Preferred format" : "Format preferat"}</Label>
          <select
            id="nm-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as "online" | "fizic" | "")}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">{lang === "en" ? "No preference" : "Fără preferință"}</option>
            <option value="online">Online</option>
            <option value="fizic">{lang === "en" ? "In person (Bucharest)" : "Fizic (București)"}</option>
          </select>
        </div>
      </div>

      <GdprCheckbox checked={gdpr} onCheckedChange={setGdpr} />

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BellRing className="w-4 h-4 mr-2" />}
        {lang === "en" ? "Add me to the list" : "Adaugă-mă pe listă"}
      </Button>
    </form>
  );
};

export default NotifyMeForm;
