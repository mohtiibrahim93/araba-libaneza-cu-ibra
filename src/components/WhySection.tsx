import { useI18n } from "@/lib/i18n";

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

type Card = { title: string; text: string };

const RO: Card[] = [
  {
    title: "Singurul centru de arabă libaneză din București",
    text: "Înveți dialectul care se vorbește, nu araba din carte. Libaneza e una dintre cele mai populare variante ale arabei și e înțeleasă în mare parte din lumea arabă.",
  },
  {
    title: "Ușor de început",
    text: "Scrii cum auzi, în Arabizi, fără alfabet de învățat înainte. Întâi vorbești, gramatica vine după: metoda Oral First.",
  },
  {
    title: "O libaneză „albă”, apropiată de Beirut",
    text: "Fără accente regionale (nord, Bekaa, sud). Îți arătăm însă sinonimele și felurile diferite de a scrie, ca să le recunoști oriunde în Liban.",
  },
  {
    title: "Pronunție corectă",
    text: "Lucrăm sunetele specifice arabei (2, 3, 5, 7, 8 și celelalte): respirația, silabele, poziția limbii și a dinților, până le pronunți corect.",
  },
  {
    title: "Tot ce alții nu predau",
    text: "Cultură, obiceiuri, umor, clișee, argou, chiar și înjurăturile: nu ca să le folosești, ci ca să le recunoști și să știi cum să reacționezi. Nimic nu e tabu într-o abordare academică și realistă.",
  },
  {
    title: "Structurat și personal",
    text: "De la A1 la C2, de la primele expresii la argou, cu obiective clare pe fiecare nivel. Și atenție personală, chiar și în grup.",
  },
];

const EN: Card[] = [
  {
    title: "The only Lebanese Arabic centre in Bucharest",
    text: "You learn the dialect people actually speak, not textbook Arabic. Lebanese is one of the most popular varieties of Arabic and is understood across much of the Arab world.",
  },
  {
    title: "Easy to start",
    text: "You write what you hear, in Arabizi, with no alphabet to learn first. You speak first and grammar comes after: the Oral First method.",
  },
  {
    title: "A neutral (“white”) Lebanese, close to Beirut's",
    text: "No regional accents (north, Bekaa, south). We do show you the synonyms and the different spellings, so you recognise them anywhere in Lebanon.",
  },
  {
    title: "Correct pronunciation",
    text: "We work on the sounds specific to Arabic (2, 3, 5, 7, 8 and the rest): breathing, syllables, the position of the tongue and teeth, until you pronounce them correctly.",
  },
  {
    title: "What others don't teach",
    text: "Culture, customs, humour, clichés, slang, even swear words: not so you use them, but so you recognise them and know how to react. Nothing is off limits in an academic, realistic approach.",
  },
  {
    title: "Structured and personal",
    text: "From A1 to C2, from first phrases to slang, with clear goals at every level. And personal attention, even in a group.",
  },
];

const WhySection = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  const cards = en ? EN : RO;

  return (
    <section id="why" className="py-section px-gutter bg-cream scroll-mt-20">
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
          {cards.map((c, i) => (
            <li
              key={c.title}
              className="flex flex-col gap-2.5 rounded-3xl border border-[#E7E1D6] bg-card p-6 sm:p-7 dark:border-border"
            >
              <span className="text-sm font-bold tracking-[0.1em] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-bold leading-snug text-foreground">{c.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{c.text}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-4xl text-base leading-relaxed text-foreground">
          <strong>{en ? "Who is it for? " : "Pentru cine? "}</strong>
          {en
            ? "For people with Lebanese roots who want the language back, for anyone with a Lebanese partner or family, and for work: official documents are in Standard Arabic, but daily life is lived in dialect."
            : "Pentru cei cu rădăcini libaneze care vor să-și recupereze limba, pentru cei cu partener sau familie din Liban, și pentru carieră: documentele oficiale sunt în araba standard, dar viața de zi cu zi se trăiește în dialect."}
        </p>
      </div>
    </section>
  );
};

export default WhySection;
