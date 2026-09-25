import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/components/LocalizedLink";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import YallaGame from "@/components/YallaGame";

/**
 * /test-de-nivel — the placement test, on a page that actually is the test.
 *
 * Head comes from src/lib/pageMeta.ts via seoHead, shared so the static and
 * runtime <title> cannot drift apart — the same arrangement /joc and the
 * homepage use.
 *
 * The prose below the frame is not filler. Iframe content is never attributed
 * to the embedding page, so without it a crawler reads this page as empty —
 * the mistake /joc had to fix once already. It also carries the honesty this
 * page exists for: how long the test takes, and what it does not measure.
 */
const COPY = {
  ro: {
    home: "Acasă",
    crumb: "Test de nivel",
    langNote: null as string | null,
    eyebrow: "Gratuit · aproximativ 15 minute",
    h1: "Ce nivel ai la araba libaneză?",
    intro:
      "24 de întrebări în trei secțiuni, fără cronometru. Citești situații scurte și scrii răspunsul în arabizi. La final primești o recomandare de nivel și cursul care ți se potrivește.",
    knowsH2: "Știi deja ce nivel ai?",
    knowsP: "Atunci nu ai nevoie de test. Alege cursul potrivit în 30 de secunde.",
    knowsCta: "Găsește cursul potrivit",
    playedP: "Ai exersat deja în Jocul Yalla? Scorul tău din joc poate sugera nivelul, fără test.",
    playedCta: "Vezi scorul și nivelul",
    honestH2: "Ce măsoară testul — și ce nu",
    honest: [
      "Măsoară citirea și răspunsurile scurte scrise în arabizi.",
      "Nu măsoară ascultarea și nici vorbirea — acestea se verifică într-o conversație cu Ibrahim.",
      "Rezultatul este o recomandare de pornire, nu o certificare CEFR.",
      "Poți răspunde „Nu știu”. Este înregistrat ca atare și nu îți strică rezultatul.",
      "Nu ai nevoie de cont. Progresul rămâne în browserul tău.",
    ],
    afterH2: "După test",
    afterP:
      "Rezultatul îți arată nivelul de pornire și te duce direct la cursul potrivit. Grupa se confirmă într-o discuție scurtă cu Ibrahim — de aceea recomandarea este un punct de plecare, nu o încadrare finală.",
  },
  en: {
    home: "Home",
    crumb: "Level test",
    langNote:
      "The test itself runs in Romanian: it scores answers in Arabizi against meanings written in Romanian, so there is no English version of it. The result and the course recommendation are in English.",
    eyebrow: "Free · about 15 minutes",
    h1: "What is your level in Lebanese Arabic?",
    intro:
      "24 questions in three sections, with no timer. You read short situations and write your answer in Arabizi. At the end you get a level recommendation and the course that matches it.",
    knowsH2: "Already know your level?",
    knowsP: "Then you do not need the test. Pick the right course in 30 seconds.",
    knowsCta: "Find the right course",
    playedP: "Already practising in the Yalla game? Your game score can suggest a level, no test needed.",
    playedCta: "See your score and level",
    honestH2: "What the test measures — and what it does not",
    honest: [
      "It measures reading and short written answers in Arabizi.",
      "It does not measure listening or speaking — those are checked in a conversation with Ibrahim.",
      "The result is a starting recommendation, not a CEFR certification.",
      "You can answer “I don't know”. It is recorded as such and does not count against you.",
      "No account needed. Your progress stays in your own browser.",
    ],
    afterH2: "After the test",
    afterP:
      "The result shows your starting level and takes you straight to the matching course. The group is confirmed in a short conversation with Ibrahim, which is why the recommendation is a starting point rather than a final placement.",
  },
} as const;

const TestDeNivel = () => {
  const { lang } = useI18n();
  const c = COPY[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* The head is the route's alone (src/lib/seoHead.ts, from
          TEST_NIVEL_META): self-canonical, because this page is the test and
          nothing else should claim the query. */}
      <Navbar />

      <main id="main-content" className="flex-1 pt-16">
        <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-content px-gutter pb-2 pt-6 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link to="/" className="transition-colors hover:text-foreground">{c.home}</Link></li>
            <li aria-hidden="true"><ChevronRight className="inline h-3.5 w-3.5 -mt-0.5" /></li>
            <li className="font-medium text-foreground" aria-current="page">{c.crumb}</li>
          </ol>
        </nav>

        <header className="mx-auto w-full max-w-content px-gutter pb-8 pt-4 text-center">
          <span className="mb-2 block text-sm font-medium text-primary">{c.eyebrow}</span>
          <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground mb-3">{c.h1}</h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">{c.intro}</p>
          {/* Only an English reader is surprised by this, so only they are told
              — the same arrangement /joc uses for the game itself. */}
          {c.langNote && (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {c.langNote}
            </p>
          )}
        </header>

        {/* The test itself. `placement` is one of the game's own views, so this
            opens straight on it rather than on the practice game. */}
        <div className="mx-auto w-full max-w-content px-gutter pb-section-sm">
          <YallaGame lang={lang} mode="placement" />
        </div>

        <section className="mx-auto w-full max-w-content px-gutter pb-section-sm">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{c.honestH2}</h2>
              <ul className="mt-3 space-y-2 text-muted-foreground leading-relaxed">
                {c.honest.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden className="text-primary">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{c.afterH2}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{c.afterP}</p>

              <div className="mt-8 rounded-xl border bg-card p-6">
                <h2 className="font-display text-xl font-bold text-foreground">{c.knowsH2}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{c.knowsP}</p>
                <Link
                  to="/quiz"
                  className="mt-4 inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  {c.knowsCta}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
                {/* The game's practice history is a level signal too — the
                    alternative to sitting this test. */}
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {c.playedP}{" "}
                  <Link to="/joc/scor" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                    {c.playedCta}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default TestDeNivel;
