import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import { Link } from "@/components/LocalizedLink";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import { JOC_SCOR_META } from "@/lib/pageMeta";
import {
  readYallaProgress,
  summarizeYalla,
  suggestLevel,
  type YallaSummary,
  type LevelSuggestion,
} from "@/lib/yallaProgress";

/**
 * /joc/scor — the visitor's game score, read from their own browser, and the
 * A1/A2/B1 level it suggests. An alternative door into the same conversation
 * as /test-de-nivel: some visitors would rather play for a while than sit a
 * test, and their practice history is a real signal.
 *
 * The score lives in localStorage, so it can only be read after mount — the
 * server HTML carries the intro and the empty-state copy, never a number.
 * Romanian only, like /joc: the card bank's meanings are Romanian.
 */
const COPY = {
  ro: {
    home: "Acasă",
    crumbGame: "Joacă",
    crumb: "Scorul tău",
    eyebrow: "Din browserul tău · fără cont",
    h1: "Scorul tău din Jocul Yalla",
    intro:
      "Jocul îți ține progresul în browser: cât ai exersat, ce ai consolidat și cum ai trecut testul de orientare. De aici poți vedea ce nivel sugerează totul — și cursul care ți se potrivește.",
    emptyH2: "Nu am găsit încă progres în joc",
    emptyP:
      "Pe acest dispozitiv nu există runde jucate. Deschide jocul și exersează câteva runde — sau, dacă vrei un răspuns pe loc, fă testul de nivel.",
    emptyCtaGame: "Deschide jocul",
    emptyCtaTest: "Fă testul de nivel",
    scoreH2: "Ce ai strâns până acum",
    statXp: "XP adunate",
    statRang: "Rang",
    statRounds: "runde încheiate",
    statPracticed: "expresii exersate",
    statMastered: "expresii consolidate",
    masteredNote:
      "„Consolidat” înseamnă trei răspunsuri corecte consecutive, fără indiciu — un semnal de practică reală, nu o notă.",
    levelH2: "Nivelul sugerat",
    levelFromTest: "Din testul de orientare din joc",
    levelFromPractice: "Estimat din ce ai exersat",
    levelDisclaimer:
      "Sugestia este orientativă: măsoară citirea și recunoașterea, nu ascultarea sau vorbirea. Grupa se confirmă într-o conversație cu Ibrahim.",
    ctaCourse: "Vezi cursul potrivit",
    ctaTrial: "Lecție de probă gratuită",
    altH2: "Vrei un răspuns mai precis?",
    altP:
      "Testul de nivel clasic are 24 de întrebări scrise și verifică mai atent gramatica, nu doar vocabularul. Durează circa 15 minute.",
    altCta: "Fă testul de nivel",
  },
  en: {
    home: "Home",
    crumbGame: "Play",
    crumb: "Your score",
    eyebrow: "From your browser · no account",
    h1: "Your Yalla game score",
    intro:
      "The game keeps your progress in your browser: how much you practised, what you retained and how the placement quiz went. From that, this page shows the level it suggests — and the course that fits. The numbers themselves come from the Romanian-language card bank, so they are shown in Romanian.",
    emptyH2: "No game progress found yet",
    emptyP:
      "There are no rounds played on this device. Open the game and practise a few rounds — or, if you want an answer right away, take the level test.",
    emptyCtaGame: "Open the game",
    emptyCtaTest: "Take the level test",
    scoreH2: "What you have collected",
    statXp: "XP earned",
    statRang: "Rank",
    statRounds: "rounds finished",
    statPracticed: "expressions practised",
    statMastered: "expressions retained",
    masteredNote:
      "“Retained” means three correct answers in a row without a hint — a real practice signal, not a grade.",
    levelH2: "The suggested level",
    levelFromTest: "From the in-game placement quiz",
    levelFromPractice: "Estimated from your practice",
    levelDisclaimer:
      "The suggestion is indicative: it measures reading and recognition, not listening or speaking. Group placement is confirmed in a conversation with Ibrahim.",
    ctaCourse: "See the right course",
    ctaTrial: "Free trial lesson",
    altH2: "Want a sharper answer?",
    altP:
      "The classic level test has 24 written questions and checks grammar more carefully, not just vocabulary. It takes about 15 minutes.",
    altCta: "Take the level test",
  },
} as const;

const JocScor = () => {
  const { lang } = useI18n();
  const c = COPY[lang];

  const [summary, setSummary] = useState<YallaSummary | null>(null);
  const [suggestion, setSuggestion] = useState<LevelSuggestion | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const state = readYallaProgress(window.localStorage);
    if (state) {
      const s = summarizeYalla(state);
      setSummary(s);
      setSuggestion(suggestLevel(s));
    }
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{JOC_SCOR_META.title}</title>
        <meta name="description" content={JOC_SCOR_META.description} />
        <link rel="canonical" href="https://centruldearabalibaneza.com/joc/scor" />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={JOC_SCOR_META.title} />
        <meta property="og:description" content={JOC_SCOR_META.description} />
        <meta property="og:url" content="https://centruldearabalibaneza.com/joc/scor" />
        <meta property="og:locale" content="ro_RO" />
      </Helmet>

      <Navbar />

      <main id="main-content" className="flex-1 pt-16">
        <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-content px-gutter pb-2 pt-6 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link to="/" className="transition-colors hover:text-foreground">{c.home}</Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="inline h-3.5 w-3.5 -mt-0.5" /></li>
            <li>
              <Link to="/joc" className="transition-colors hover:text-foreground">{c.crumbGame}</Link>
            </li>
            <li aria-hidden="true"><ChevronRight className="inline h-3.5 w-3.5 -mt-0.5" /></li>
            <li className="font-medium text-foreground" aria-current="page">{c.crumb}</li>
          </ol>
        </nav>

        <header className="mx-auto w-full max-w-content px-gutter pb-8 pt-4 text-center">
          <span className="mb-2 block text-sm font-medium text-primary">{c.eyebrow}</span>
          <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground mb-3">
            {c.h1}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            {c.intro}
          </p>
        </header>

        <div className="mx-auto w-full max-w-content px-gutter pb-section-sm">
          {loaded && !summary && (
            <div className="rounded-xl border bg-card p-6 text-center sm:p-10">
              <h2 className="font-display text-2xl font-bold text-foreground">{c.emptyH2}</h2>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">{c.emptyP}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/joc">{c.emptyCtaGame}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/test-de-nivel">{c.emptyCtaTest}</Link>
                </Button>
              </div>
            </div>
          )}

          {loaded && summary && suggestion && (
            <div className="space-y-8">
              <section aria-labelledby="scor-stats">
                <h2 id="scor-stats" className="font-display text-2xl font-bold text-foreground">
                  {c.scoreH2}
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    [summary.xp, c.statXp],
                    [summary.rang, c.statRang],
                    [summary.rounds, c.statRounds],
                    [summary.practiced, c.statPracticed],
                    [summary.mastered, c.statMastered],
                  ].map(([value, label]) => (
                    <div key={label as string} className="rounded-xl border bg-card p-4 text-center">
                      <div className="font-display text-3xl font-bold text-foreground">{value}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.masteredNote}</p>
              </section>

              <section
                aria-labelledby="scor-nivel"
                className="rounded-xl border bg-card p-6 sm:p-8"
              >
                <span className="text-sm font-medium text-primary">
                  {suggestion.source === "placement" ? c.levelFromTest : c.levelFromPractice}
                </span>
                <h2 id="scor-nivel" className="mt-1 font-display text-2xl font-bold text-foreground">
                  {c.levelH2}: {suggestion.level}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{suggestion.detail}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {c.levelDisclaimer}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link to={`/quiz?level=${suggestion.level}`}>{c.ctaCourse}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/trial">{c.ctaTrial}</Link>
                  </Button>
                </div>
              </section>
            </div>
          )}
        </div>

        <section className="w-full bg-cream">
          <div className="mx-auto w-full max-w-content px-gutter py-section">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-foreground">{c.altH2}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{c.altP}</p>
              <Link
                to="/test-de-nivel"
                className="mt-4 inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                {c.altCta}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
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

export default JocScor;
