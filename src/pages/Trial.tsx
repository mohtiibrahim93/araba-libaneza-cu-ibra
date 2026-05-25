import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import GdprCheckbox from "@/components/GdprCheckbox";
import NativeScheduler from "@/components/NativeScheduler";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking";

const TrialPage = () => {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdpr) {
      toast.error(t.bookingGdprRequired);
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error(t.schedulerNameRequired);
      return;
    }
    setSubmitting(true);
    try {
      const id = crypto.randomUUID();
      const { error } = await supabase.from("registrations").insert({
        id,
        form_type: "trial",
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        lead_status: "new",
      });
      if (error) throw error;
      trackEvent("Lead", { content_name: "trial" });
      setRegistrationId(id);
    } catch (err) {
      console.error("[trial] insert failed", err);
      toast.error(t.schedulerBookingFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const title = `${t.trialPageSeoTitle} — ${t.siteTitle}`;

  return (
    <main className="min-h-screen bg-background py-12 px-6">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={t.trialPageSeoDesc} />
        <link rel="canonical" href="https://centruldearabalibaneza.com/trial" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={t.trialPageSeoDesc} />
      </Helmet>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {t.navHome}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t.trialPageTitle}</h1>
        <p className="text-muted-foreground mb-8">{t.trialPageSubtitle}</p>

        {!registrationId ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-background rounded-2xl border border-border p-6 shadow-sm"
          >
            <div className="space-y-2">
              <Label htmlFor="trial-name">{t.labelName} *</Label>
              <Input
                id="trial-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.placeholderName}
                required
                maxLength={100}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trial-email">{t.labelEmail} *</Label>
                <Input
                  id="trial-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholderEmail}
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial-phone">{t.labelPhone} *</Label>
                <Input
                  id="trial-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.placeholderPhone}
                  required
                  maxLength={30}
                />
              </div>
            </div>
            <GdprCheckbox checked={gdpr} onCheckedChange={setGdpr} />
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {submitting ? t.trialFormSubmitting : t.trialFormCta}
            </Button>
          </form>
        ) : (
          <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
            <NativeScheduler
              eventType="trial"
              registrationId={registrationId}
              prefill={{ name, email, phone }}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default TrialPage;