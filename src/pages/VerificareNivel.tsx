import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronRight, Loader2, MessageCircle, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/components/LocalizedLink";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import NativeScheduler from "@/components/NativeScheduler";
import { isValidPhone } from "@/components/RegistrationForm/LeadFields";
import { useTrialRegistration } from "@/hooks/useTrialRegistration";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { WHATSAPP_CONTACT_URL } from "@/lib/social";
import { cn } from "@/lib/utils";

/**
 * /verificare-nivel — the free level check with Ibra (October 2026).
 *
 * The owner's offer: up to 30 minutes, on Zoom or at the center, a short
 * conversation plus a few written questions in arabizi (the only script the
 * courses use for now). It is not the trial lesson — nothing is taught.
 *
 * Three ways in, because people differ in how they like to ask:
 * - a time in the booking calendar (event type `verificare-nivel`, free, no
 *   card — booking-create treats it like the trial for payment);
 * - "Ibra calls you back": a registration with form_type `level_check`, which
 *   notify-registration sends to the admin inbox;
 * - WhatsApp, with the message already written.
 */
type Way = "calendar" | "callback" | "whatsapp";

const COPY = {
  ro: {
    home: "Acasă",
    crumb: "Verificare de nivel",
    eyebrow: "Gratuit · până la 30 de minute",
    h1: "Verificare de nivel cu Ibra",
    lead: "O discuție scurtă cu Ibra, pe Zoom sau la centru, ca să afli exact de unde pornești și ce grupă ți se potrivește. Fără lecție, fără obligații.",
    howH2: "Cum decurge",
    how: [
      ["Vorbim", "Câteva minute de conversație în libaneză, pe măsura ta — chiar și dacă știi doar câteva cuvinte."],
      ["Scrii puțin", "Câteva întrebări scurte la care răspunzi în scris, în arabizi (litere latine și cifre)."],
      ["Afli nivelul", "Ibra îți spune pe loc nivelul și grupa sau formatul care ți se potrivesc."],
    ],
    notTrial: "Nu e lecția de probă: aici doar îți verificăm nivelul. Dacă vrei să vezi cum arată o lecție,",
    notTrialLink: "rezervă lecția de probă gratuită",
    script: "Partea scrisă e în arabizi, pentru că toate cursurile folosesc deocamdată arabizi.",
    waysH2: "Cum vrei să o programezi?",
    ways: {
      calendar: ["Alege o oră", "Vezi orele libere și rezervi direct."],
      callback: ["Te sună Ibra", "Lași numărul și Ibra te contactează să stabiliți ora."],
      whatsapp: ["Scrie pe WhatsApp", "Mesajul e deja scris, doar îl trimiți."],
    } as Record<Way, [string, string]>,
    calendarNote: "Alege Online (Zoom) sau Fizic (la centrul din București) în formularul de rezervare.",
    name: "Nume",
    phone: "Telefon",
    email: "Email (opțional)",
    where: "Unde preferi?",
    zoom: "Online, pe Zoom",
    center: "La centru, în București",
    when: "Când te putem suna? (opțional)",
    whenPh: "de ex. după ora 18, în timpul săptămânii",
    consent: "Sunt de acord să fiu contactat pentru verificarea de nivel. Vezi",
    privacy: "politica de confidențialitate",
    send: "Vreau să mă sune Ibra",
    sending: "Se trimite…",
    invalidPhone: "Scrie un număr de telefon valid.",
    needConsent: "Bifează acordul ca să te putem contacta.",
    failed: "Nu am putut trimite cererea. Încearcă din nou sau scrie-ne pe WhatsApp.",
    doneH: "Gata, am primit cererea",
    doneP: "Ibra te sună în curând ca să stabiliți ora. Dacă vrei să grăbești lucrurile, scrie-i pe WhatsApp.",
    waText: "Bună, Ibra! Aș vrea o verificare de nivel gratuită (online pe Zoom / la centru).",
    waBtn: "Deschide WhatsApp",
    waNote: "Se deschide WhatsApp cu mesajul gata scris. Poți schimba Zoom / centru înainte să-l trimiți.",
    otherH2: "Vrei să afli singur, acum?",
    otherQuiz: "Quiz-ul de 30 de secunde",
    otherQuizP: "îți recomandă formatul de curs potrivit.",
    otherTest: "Testul de nivel online",
    otherTestP: "24 de întrebări, aproximativ 15 minute, fără cont.",
  },
  en: {
    home: "Home",
    crumb: "Level check",
    eyebrow: "Free · up to 30 minutes",
    h1: "Level check with Ibra",
    lead: "A short conversation with Ibra, on Zoom or at the center, to find out exactly where you start and which group suits you. No lesson, no commitment.",
    howH2: "How it works",
    how: [
      ["We talk", "A few minutes of conversation in Lebanese, at your pace — even if you only know a few words."],
      ["You write a little", "A few short questions you answer in writing, in Arabizi (Latin letters and numbers)."],
      ["You get your level", "Ibra tells you straight away which level and which group or format suit you."],
    ],
    notTrial: "This is not the trial lesson: we only check your level here. If you want to see what a lesson looks like,",
    notTrialLink: "book the free trial lesson",
    script: "The written part is in Arabizi, because all the courses use Arabizi for now.",
    waysH2: "How would you like to book it?",
    ways: {
      calendar: ["Pick a time", "See the free times and book directly."],
      callback: ["Ibra calls you", "Leave your number and Ibra gets in touch to agree a time."],
      whatsapp: ["Message on WhatsApp", "The message is already written, just send it."],
    } as Record<Way, [string, string]>,
    calendarNote: "Choose Online (Zoom) or In person (at the Bucharest center) in the booking form.",
    name: "Name",
    phone: "Phone",
    email: "Email (optional)",
    where: "Where would you prefer?",
    zoom: "Online, on Zoom",
    center: "At the center, in Bucharest",
    when: "When can we call you? (optional)",
    whenPh: "e.g. after 6 pm on weekdays",
    consent: "I agree to be contacted about the level check. See the",
    privacy: "privacy policy",
    send: "I'd like Ibra to call me",
    sending: "Sending…",
    invalidPhone: "Please enter a valid phone number.",
    needConsent: "Please tick the consent box so we can contact you.",
    failed: "We couldn't send your request. Please try again or message us on WhatsApp.",
    doneH: "Done, we have your request",
    doneP: "Ibra will call you soon to agree a time. If you'd like to speed things up, message Ibra on WhatsApp.",
    waText: "Hi Ibra! I'd like a free level check (online on Zoom / at the center).",
    waBtn: "Open WhatsApp",
    waNote: "WhatsApp opens with the message ready. You can change Zoom / center before sending it.",
    otherH2: "Rather find out on your own, right now?",
    otherQuiz: "The 30-second quiz",
    otherQuizP: "recommends the right course format.",
    otherTest: "The online level test",
    otherTestP: "24 questions, about 15 minutes, no account.",
  },
} as const;

const WAYS: { id: Way; Icon: typeof CalendarDays }[] = [
  { id: "calendar", Icon: CalendarDays },
  { id: "callback", Icon: PhoneCall },
  { id: "whatsapp", Icon: MessageCircle },
];

const input = "w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm dark:bg-background";

const CallbackForm = () => {
  const { lang } = useI18n();
  const c = COPY[lang];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [where, setWhere] = useState<"online" | "physical">("online");
  const [when, setWhen] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (!isValidPhone(phone)) return void toast.error(c.invalidPhone);
    if (!consent) return void toast.error(c.needConsent);
    setSending(true);
    const id = crypto.randomUUID();
    const notes = [
      "Vrea să fie sunat pentru verificarea de nivel.",
      where === "online" ? "Preferă: online (Zoom)." : "Preferă: la centru.",
      when.trim() ? `Când: ${when.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const { error } = await supabase.from("registrations").insert({
      id,
      form_type: "level_check",
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      format: where,
      notes,
      language: lang,
      lead_status: "new",
    });
    if (error) {
      console.error("[verificare-nivel] callback insert failed", error);
      toast.error(c.failed);
      setSending(false);
      return;
    }
    // Sends Ibra the "new registration" email; the visitor gets none for this
    // form type, the call is the confirmation.
    void supabase.functions.invoke("notify-registration", { body: { registrationId: id, email: email.trim() } });
    setDone(true);
    setSending(false);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-green/30 bg-brand-green/5 p-6">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <CheckCircle2 className="h-5 w-5 text-brand-green" aria-hidden /> {c.doneH}
        </p>
        <p className="mt-2 text-sm text-foreground/80">{c.doneP}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1.5 text-sm font-medium">
        <span>{c.name} *</span>
        <input required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} />
      </label>
      <label className="space-y-1.5 text-sm font-medium">
        <span>{c.phone} *</span>
        <input required maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="07xx xxx xxx" className={input} />
      </label>
      <label className="space-y-1.5 text-sm font-medium">
        <span>{c.email}</span>
        <input type="email" maxLength={320} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} />
      </label>
      <fieldset className="space-y-1.5 text-sm">
        <legend className="mb-1.5 font-medium">{c.where}</legend>
        <div className="flex flex-wrap gap-2">
          {([
            ["online", c.zoom],
            ["physical", c.center],
          ] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={where === v}
              onClick={() => setWhere(v)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm font-semibold transition",
                where === v ? "border-brand-green bg-brand-green text-white" : "border-[#E7E1D6] bg-white text-foreground hover:border-brand-green/50 dark:bg-background",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
        <span>{c.when}</span>
        <input maxLength={300} value={when} onChange={(e) => setWhen(e.target.value)} placeholder={c.whenPh} className={input} />
      </label>
      <label className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground sm:col-span-2">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-green" />
        <span>
          {c.consent}{" "}
          <Link to="/privacy" className="text-primary underline">{c.privacy}</Link>.
        </span>
      </label>
      <button
        type="submit"
        disabled={sending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
        {sending ? c.sending : c.send}
      </button>
    </form>
  );
};

const VerificareNivel = () => {
  const { lang } = useI18n();
  const c = COPY[lang];
  const [way, setWay] = useState<Way | null>(null);
  const ensureRegistration = useTrialRegistration("level_check");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const waHref = `${WHATSAPP_CONTACT_URL}?text=${encodeURIComponent(c.waText)}`;
  const card = "rounded-2xl border border-[#E7E1D6] bg-card dark:border-border";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="bg-cream pt-24 pb-section-sm">
          <div className="mx-auto w-full max-w-content px-gutter">
            <nav aria-label="Breadcrumb" className="pt-8 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">{c.home}</Link>
              <ChevronRight className="mx-1 -mt-0.5 inline h-3.5 w-3.5" aria-hidden />
              <span className="text-foreground">{c.crumb}</span>
            </nav>
            <header className="mx-auto mt-8 max-w-3xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-green">{c.eyebrow}</p>
              <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground">{c.h1}</h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{c.lead}</p>
            </header>
          </div>
        </div>

        <section className="mx-auto w-full max-w-content px-gutter py-section-sm">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{c.howH2}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {c.how.map(([h, p], i) => (
              <div key={h} className={cn(card, "p-6")}>
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">{i + 1}</span>
                <h3 className="font-display text-xl font-bold text-foreground">{h}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-cream px-5 py-4 text-sm leading-relaxed text-foreground/80">
            <p>
              {c.notTrial}{" "}
              <Link to="/trial" className="font-semibold text-brand-green underline underline-offset-4">{c.notTrialLink}</Link>.
            </p>
            <p className="mt-1">{c.script}</p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-content px-gutter pb-section-sm">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{c.waysH2}</h2>
          <div role="radiogroup" aria-label={c.waysH2} className="mt-5 grid gap-3 md:grid-cols-3">
            {WAYS.map(({ id, Icon }) => {
              const [title, text] = c.ways[id];
              const on = way === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setWay(id)}
                  className={cn(
                    card,
                    "flex items-start gap-4 p-5 text-left transition",
                    on ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green" : "hover:border-brand-green/50",
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold text-foreground">{title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {way === "calendar" && (
            <div className={cn(card, "mt-5 p-6")}>
              <p className="mb-4 text-sm text-foreground/80">{c.calendarNote}</p>
              <NativeScheduler eventType="verificare-nivel" ensureRegistration={ensureRegistration} />
            </div>
          )}
          {way === "callback" && (
            <div className={cn(card, "mt-5 p-6")}>
              <CallbackForm />
            </div>
          )}
          {way === "whatsapp" && (
            <div className={cn(card, "mt-5 flex flex-col items-start gap-3 p-6")}>
              <p className="rounded-xl bg-cream px-4 py-3 text-sm italic text-foreground/80">„{c.waText}”</p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#25D366] px-6 font-semibold text-white transition hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" aria-hidden /> {c.waBtn}
              </a>
              <p className="text-xs text-muted-foreground">{c.waNote}</p>
            </div>
          )}
        </section>

        <section className="mx-auto w-full max-w-content px-gutter pb-section">
          <h2 className="font-display text-xl font-bold text-foreground">{c.otherH2}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/quiz" className="font-semibold text-brand-green underline underline-offset-4">{c.otherQuiz}</Link> {c.otherQuizP}
            </li>
            <li>
              <Link to="/test-de-nivel" className="font-semibold text-brand-green underline underline-offset-4">{c.otherTest}</Link> — {c.otherTestP}
            </li>
          </ul>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default VerificareNivel;
