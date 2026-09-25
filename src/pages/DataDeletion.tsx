import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";

const content = {
  ro: {
    title: "Ștergerea datelor personale",
    seoTitle: "Ștergerea datelor (GDPR) — centrul de araba libaneza",
    intro:
      "Conform GDPR, ai dreptul să ceri ștergerea datelor tale personale (nume, telefon, email, înscrieri). Completează formularul de mai jos și rezolvăm cererea în cel mult 30 de zile — de regulă mult mai repede. Vei primi confirmarea pe email.",
    emailLabel: "Emailul folosit la înscriere",
    nameLabel: "Nume (opțional)",
    messageLabel: "Mesaj (opțional)",
    submit: "Trimite cererea de ștergere",
    submitting: "Se trimite...",
    successTitle: "Cererea a fost trimisă",
    successBody:
      "Am primit cererea ta de ștergere. O procesăm în cel mult 30 de zile și îți confirmăm pe email. Dacă e urgent, scrie-ne la marhaba@centruldearabalibaneza.com.",
    errorGeneric: "Trimiterea a eșuat. Încearcă din nou sau scrie-ne la marhaba@centruldearabalibaneza.com.",
    errorEmail: "Introdu un email valid.",
  },
  en: {
    title: "Delete my personal data",
    seoTitle: "Data deletion (GDPR) — lebanese arabic center",
    intro:
      "Under GDPR you have the right to request deletion of your personal data (name, phone, email, registrations). Fill in the form below and we will resolve the request within 30 days — usually much faster. You will receive a confirmation by email.",
    emailLabel: "The email you registered with",
    nameLabel: "Name (optional)",
    messageLabel: "Message (optional)",
    submit: "Send deletion request",
    submitting: "Sending...",
    successTitle: "Request sent",
    successBody:
      "We received your deletion request. We will process it within 30 days and confirm by email. If it's urgent, write to marhaba@centruldearabalibaneza.com.",
    errorGeneric: "Sending failed. Try again or write to marhaba@centruldearabalibaneza.com.",
    errorEmail: "Enter a valid email.",
  },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DataDeletion = () => {
  const { lang } = useI18n();
  const page = content[lang];
  // The head — title, description and the noindex — is served by the route
  // from src/lib/seoHead.ts; writing it here as well put two of each in the
  // HTML, which is what the crawl reported.
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError(page.errorEmail);
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("gdpr-request", {
        body: { email: email.trim(), name: name.trim() || undefined, message: message.trim() || undefined },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error && err.message !== "" ? page.errorGeneric : page.errorGeneric);
      console.error("gdpr-request failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="max-w-xl mx-auto px-gutter py-16">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{page.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">{page.intro}</p>

        {sent ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">{page.successTitle}</h2>
            <p className="text-sm text-muted-foreground">{page.successBody}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="gdpr-email">{page.emailLabel} *</Label>
              <Input
                id="gdpr-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error === page.errorEmail || undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gdpr-name">{page.nameLabel}</Label>
              <Input id="gdpr-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gdpr-message">{page.messageLabel}</Label>
              <Textarea
                id="gdpr-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                className="min-h-24"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {page.submitting}
                </>
              ) : (
                page.submit
              )}
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DataDeletion;
