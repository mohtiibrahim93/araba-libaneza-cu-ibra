/**
 * /contact (RO) · /en/contact (EN)
 *
 * Until now every "talk to us" path on the site ended in WhatsApp or a raw
 * mailto:. Both are fine for people who use them, but a visitor who writes
 * from a desktop, or who simply does not want to hand over a phone number,
 * had no way to reach the centre — and nothing was recorded anywhere.
 *
 * The form writes to public.contact_messages (anon INSERT only, admin reads
 * through the service role), so messages land in the backend the same way
 * registrations and course requests do, rate-limited by the same mechanism.
 * The existing channels stay visible next to it: this page adds an option,
 * it does not replace WhatsApp.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Send, CheckCircle2, Loader2, Clock, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import GdprCheckbox from "@/components/GdprCheckbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WHATSAPP_CONTACT_URL } from "@/lib/social";
import { isValidEmail, isValidPhone } from "@/components/RegistrationForm/LeadFields";
import { trackGenerateLead } from "@/lib/tracking";
import { GOOGLE_MAPS_PROFILE_URL, GOOGLE_REVIEW_URL } from "@/lib/googleBusiness";
import GoogleMapEmbed from "@/components/GoogleMapEmbed";

const EMAIL = "marhaba@centruldearabalibaneza.com";
const PHONE_LABEL = "+40 763 124 514";
const ADDRESS = "Raduga Creative Center, Strada Icoanei 80, București";
const MAPS_URL = GOOGLE_MAPS_PROFILE_URL;

const COPY = {
  ro: {
    h1: "Contact",
    lead: "Scrie-ne despre cursuri, orare, niveluri sau grupele pentru copii. Răspundem de obicei în aceeași zi.",
    formTitle: "Trimite un mesaj",
    formLead: "Completează formularul și îți răspundem pe email.",
    name: "Nume",
    email: "Email",
    phone: "Telefon (opțional)",
    message: "Mesajul tău",
    messagePlaceholder: "Ce nivel ai, ce format te interesează (online sau fizic) și când ai fi disponibil.",
    send: "Trimite mesajul",
    sending: "Se trimite…",
    sentTitle: "Mesajul a fost trimis",
    sentBody: "Îți răspundem pe emailul lăsat, de obicei în aceeași zi lucrătoare.",
    sentAgain: "Trimite alt mesaj",
    channels: "Alte moduri de a ne scrie",
    whatsapp: "WhatsApp și telefon",
    whatsappNote: "Cel mai rapid răspuns.",
    emailLabel: "Email",
    center: "Centrul din București",
    hours: "Program de răspuns",
    hoursNote: "Luni–duminică, 10:00–21:00 (ora României).",
    errName: "Te rugăm să scrii numele.",
    errEmail: "Te rugăm să scrii un email valid.",
    errPhone: "Numărul de telefon nu pare valid.",
    errMessage: "Scrie te rugăm câteva cuvinte în mesaj.",
    errGdpr: "Te rugăm să accepți politica de confidențialitate.",
    errSend: "Mesajul nu a putut fi trimis. Încearcă din nou sau scrie-ne pe WhatsApp.",
    alt: "Preferi să vorbim direct? Rezervă o lecție de probă gratuită.",
    altCta: "Lecție de probă gratuită",
    reviewLead: "Ai învățat cu noi? O recenzie pe Google îi ajută pe alții să ne găsească.",
    reviewCta: "Lasă-ne o recenzie pe Google",
  },
  en: {
    h1: "Contact",
    lead: "Write to us about courses, schedules, levels or the children's groups. We usually reply the same day.",
    formTitle: "Send a message",
    formLead: "Fill in the form and we'll reply by email.",
    name: "Name",
    email: "Email",
    phone: "Phone (optional)",
    message: "Your message",
    messagePlaceholder: "Your level, the format you're interested in (online or in person) and when you're available.",
    send: "Send message",
    sending: "Sending…",
    sentTitle: "Message sent",
    sentBody: "We'll reply to the email you left, usually within the same working day.",
    sentAgain: "Send another message",
    channels: "Other ways to reach us",
    whatsapp: "WhatsApp and phone",
    whatsappNote: "Fastest reply.",
    emailLabel: "Email",
    center: "The Bucharest centre",
    hours: "Reply hours",
    hoursNote: "Monday–Sunday, 10:00–21:00 (Romania time).",
    errName: "Please tell us your name.",
    errEmail: "Please enter a valid email address.",
    errPhone: "That phone number doesn't look valid.",
    errMessage: "Please write a few words in your message.",
    errGdpr: "Please accept the privacy policy.",
    errSend: "The message couldn't be sent. Please try again, or message us on WhatsApp.",
    alt: "Rather talk in person? Book a free trial lesson.",
    altCta: "Free trial lesson",
    reviewLead: "Learned with us? A Google review helps others find us.",
    reviewCta: "Leave us a review on Google",
  },
} as const;

const Contact = ({ lang }: { lang: "ro" | "en" }) => {
  const c = COPY[lang];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [gdprError, setGdprError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error(c.errName);
      return;
    }
    if (!isValidEmail(email)) {
      toast.error(c.errEmail);
      return;
    }
    if (phone.trim() && !isValidPhone(phone)) {
      toast.error(c.errPhone);
      return;
    }
    if (message.trim().length < 5) {
      toast.error(c.errMessage);
      return;
    }
    if (!gdpr) {
      setGdprError(c.errGdpr);
      return;
    }
    setGdprError(undefined);
    setSubmitting(true);
    try {
      // The server route records the message and emails the centre's inbox
      // with the visitor's address as Reply-To.
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim(),
          language: lang,
          gdpr: true,
        }),
      });
      if (!response.ok) throw new Error(`contact endpoint returned ${response.status}`);
      trackGenerateLead("contact_form", { context: "contact_page" });
      setSent(true);
    } catch (err) {
      console.error("[contact] send failed", err);
      toast.error(c.errSend);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Navbar />
      {/* pt-28 clears the fixed menu (band + bar); the title used to sit under it. */}
      <main id="main-content" className="mx-auto max-w-content px-gutter pb-section pt-28">
        <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">Contact</span>
        <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground">{c.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{c.lead}</p>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="rounded-3xl border border-[#E7E1D6] bg-card p-8 text-center space-y-3 dark:border-border">
                <CheckCircle2 className="mx-auto h-10 w-10 text-brand-green" />
                <h2 className="font-display text-xl font-bold text-foreground">{c.sentTitle}</h2>
                <p className="text-sm text-muted-foreground">{c.sentBody}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSent(false);
                    setMessage("");
                  }}
                >
                  {c.sentAgain}
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-3xl border border-[#E7E1D6] bg-card p-5 sm:p-8 space-y-4 dark:border-border">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{c.formTitle}</h2>
                  <p className="text-sm text-muted-foreground">{c.formLead}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ct-name">{c.name} *</Label>
                    <Input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} autoComplete="name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ct-email">{c.email} *</Label>
                    <Input id="ct-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="ct-phone">{c.phone}</Label>
                    <Input id="ct-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} autoComplete="tel" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ct-message">{c.message} *</Label>
                  <Textarea
                    id="ct-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    maxLength={2000}
                    placeholder={c.messagePlaceholder}
                  />
                </div>
                <GdprCheckbox checked={gdpr} onCheckedChange={setGdpr} error={gdprError} />
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {c.sending}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> {c.send}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Existing channels — the form is an addition, not a replacement. */}
          <aside className="lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-foreground">{c.channels}</p>
            <ul className="mt-4 space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green"><MessageCircle className="h-4 w-4" aria-hidden="true" /></span>
                <div>
                  <a href={WHATSAPP_CONTACT_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:underline">
                    {PHONE_LABEL}
                  </a>
                  <p className="text-muted-foreground">{c.whatsapp} · {c.whatsappNote}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green"><Mail className="h-4 w-4" aria-hidden="true" /></span>
                <div>
                  <a href={`mailto:${EMAIL}`} className="font-medium leading-snug text-foreground hover:underline">
                    marhaba@<wbr />centruldearabalibaneza.com
                  </a>
                  <p className="text-muted-foreground">{c.emailLabel}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green"><MapPin className="h-4 w-4" aria-hidden="true" /></span>
                <div>
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:underline">
                    {ADDRESS}
                  </a>
                  <p className="text-muted-foreground">{c.center}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green"><Clock className="h-4 w-4" aria-hidden="true" /></span>
                <div>
                  <p className="font-medium text-foreground">{c.hours}</p>
                  <p className="text-muted-foreground">{c.hoursNote}</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 rounded-3xl bg-cream p-5">
              <p className="text-sm text-muted-foreground">{c.alt}</p>
              <Link
                to={lang === "en" ? "/en/trial" : "/trial"}
                className="mt-3 inline-flex text-sm font-semibold text-brand-green hover:underline"
              >
                {c.altCta} →
              </Link>
            </div>

            <div className="mt-4 rounded-3xl bg-cream p-5">
              <p className="text-sm text-muted-foreground">{c.reviewLead}</p>
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:underline"
              >
                <Star className="h-4 w-4" /> {c.reviewCta} →
              </a>
            </div>
          </aside>
        </div>

        <GoogleMapEmbed lang={lang} className="mt-12" />
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
