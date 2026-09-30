import { Ear, MapPin, MessagesSquare, Mic, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Link } from "@/components/LocalizedLink";

/**
 * "De ce să înveți cu Ibra?" — the owner's reasons, grouped into six cards.
 *
 * Replaces three older sections that said the same things several times
 * (the "3 simple steps", the six-benefit grid and the culture cards). The
 * wording is the owner's: the only centre in Bucharest teaching Lebanese
 * Arabic, a neutral ("white") Lebanese close to Beirut's, pronunciation work,
 * and the things other courses leave out. Card 2 is shown in practice by the
 * "Scrii cum auzi" section that follows.
 */

type Card = { Icon: LucideIcon; title: string; text: string };

const RO: Card[] = [
  {
    Icon: MapPin,
    title: "Singurul centru din București",
    text: "Dedicat arabei libaneze: dialectul care se vorbește, înțeles în mare parte din lumea arabă.",
  },
  {
    Icon: Ear,
    title: "Ușor de început",
    text: "Scrii cum auzi, în Arabizi, fără alfabet înainte. Întâi vorbești, apoi gramatica.",
  },
  {
    Icon: MessagesSquare,
    title: "Libaneza „albă”, ca la Beirut",
    text: "Fără accente regionale, dar cu sinonimele și variantele de scriere, ca să le recunoști oriunde.",
  },
  {
    Icon: Mic,
    title: "Pronunție corectă",
    text: "Sunetele 2, 3, 5, 7, 8: respirație, silabe, poziția limbii, până le spui corect.",
  },
  {
    Icon: Sparkles,
    title: "Ce alții nu predau",
    text: "Cultură, umor, expresii de zi cu zi și argou — chiar și cuvintele evitate, ca să știi ce auzi și cum să reacționezi.",
  },
  {
    Icon: TrendingUp,
    title: "Structurat și personal",
    text: "A1 → C2, cu obiective clare pe fiecare nivel și atenție personală, chiar și în grup.",
  },
];

const EN: Card[] = [
  {
    Icon: MapPin,
    title: "The only centre in Bucharest",
    text: "Dedicated to Lebanese Arabic: the dialect people speak, understood across much of the Arab world.",
  },
  {
    Icon: Ear,
    title: "Easy to start",
    text: "You write what you hear, in Arabizi, with no alphabet first. You speak first, grammar comes after.",
  },
  {
    Icon: MessagesSquare,
    title: "Neutral Lebanese, like Beirut's",
    text: "No regional accents, but with the synonyms and spellings, so you recognise them anywhere.",
  },
  {
    Icon: Mic,
    title: "Correct pronunciation",
    text: "The sounds 2, 3, 5, 7, 8: breathing, syllables, tongue position, until you say them right.",
  },
  {
    Icon: Sparkles,
    title: "What others don't teach",
    text: "Culture, humour, everyday phrases and slang — even the words others avoid, so you know what you hear and how to react.",
  },
  {
    Icon: TrendingUp,
    title: "Structured and personal",
    text: "A1 → C2, with clear goals at every level and personal attention, even in a group.",
  },
];

const WhySection = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  const cards = en ? EN : RO;

  return (
    <section id="why" className="py-section px-gutter bg-background scroll-mt-20">
      <div className="w-full max-w-content mx-auto">
        <div className="mb-10 max-w-3xl">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
            {en ? "Why the Lebanese Arabic Centre" : "De ce Centrul de Arabă Libaneză"}
          </span>
          <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground">
            {en ? "Why learn with Ibra?" : "De ce să înveți cu Ibra?"}
          </h2>
        </div>

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ Icon, title, text }, i) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-3xl border border-[#E7E1D6] bg-card p-6 sm:p-7 dark:border-border"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold tracking-[0.1em] text-muted-foreground/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold leading-snug text-foreground">{title}</h3>
              <p className="text-[15px] leading-relaxed text-foreground/80">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-5 rounded-3xl bg-brand-green px-6 py-6 text-white sm:px-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl text-base leading-relaxed text-white/90">
            <strong className="text-white">{en ? "Who is it for? " : "Pentru cine? "}</strong>
            {en
              ? "Lebanese roots, a Lebanese partner or family, or work: official papers are in Standard Arabic, but daily life happens in dialect."
              : "Rădăcini libaneze, partener sau familie din Liban, ori carieră: actele oficiale sunt în araba standard, dar viața de zi cu zi e în dialect."}
          </p>
          <Link
            to="/trial"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 font-semibold text-brand-green transition-opacity hover:opacity-90"
          >
            {en ? "Book the free trial →" : "Rezervă lecția gratuită →"}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
