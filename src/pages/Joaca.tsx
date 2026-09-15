import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import { Link } from "@/components/LocalizedLink";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import YallaGame from "@/components/YallaGame";
import { JOACA_META } from "@/lib/pageMeta";

/**
 * /joc — free practice, and the one page on the site that asks for nothing.
 *
 * Head comes from src/lib/pageMeta.ts, shared with scripts/seoPrerender.ts so
 * the static and runtime <title> cannot drift apart — the same arrangement the
 * homepage and /cursuri-limba-araba use.
 *
 * The chrome is bilingual because the navbar is, but the game itself is
 * Romanian: its card bank carries Romanian meanings only. The English copy
 * says so rather than implying a translation that does not exist.
 *
 * No English twin, so no hreflang — see the note on JOACA_META.
 */
const COPY = {
  ro: {
    home: "Acasă",
    crumb: "Joacă",
    eyebrow: "Gratuit · fără cont",
    h1: "Joacă și învață arabă libaneză",
    intro:
      "Peste 4.300 de expresii din materialele cursului, cu sens în română. Exersezi cu carduri, exerciții și potriviri, iar ce greșești se întoarce la recapitulare.",
    langNote: null as string | null,
    howH2: "Cum funcționează",
    howP:
      "O rundă are 20 de expresii. Cele noi, cele greșite și cele programate pentru recapitulare sunt acțiuni separate, ca să știi mereu ce exersezi. După fiecare răspuns corect, expresia revine peste 1, 3, 7, 14 și apoi 30 de zile — intervalele cresc doar când chiar ai reținut-o, nu pentru că ai apăsat repede.",
    progressH2: "Unde se salvează progresul",
    progressP:
      "În browserul tău, pe acest dispozitiv. Nu e un cont: nu se sincronizează între telefon și laptop și nu îl vede nimeni altcineva. Dacă schimbi dispozitivul, folosește controlul de transfer din joc — descarci progresul ca fișier și îl încarci înapoi.",
    courseH2: "Jocul nu ține loc de curs",
    courseP:
      "Exersezi singur vocabular și structuri, și atât. Pronunția, conversația și corectarea în timp real cer un profesor. Dacă vrei să vorbești, nu doar să recunoști cuvinte, începe cu o lecție de probă gratuită.",
    ctaCourses: "Vezi cursurile",
    ctaTrial: "Lecție de probă gratuită",
    levelH2: "Verifică-ți nivelul în joc",
    levelP:
      "24 de întrebări în trei secțiuni, fără cronometru. La final primești o recomandare orientativă A1, A2 sau B1 și cursul potrivit. Nu evaluează ascultarea sau vorbirea — grupa se stabilește în conversație cu Ibrahim.",
    ctaLevel: "Începe testul de nivel",
    ctaBack: "Înapoi la exerciții",
  },
  en: {
    home: "Home",
    crumb: "Play",
    eyebrow: "Free · no account",
    h1: "Play and learn Lebanese Arabic",
    intro:
      "Over 4,300 expressions from the course materials. You practise with cards, exercises and matching, and whatever you get wrong comes back for review.",
    langNote:
      "The game itself is in Romanian — its meanings are written in Romanian only, and there is no English version of the card bank.",
    howH2: "How it works",
    howP:
      "A round is 20 expressions. New ones, ones you got wrong, and ones due for review are separate actions, so you always know what you are practising. After each correct answer an expression returns in 1, 3, 7, 14 and then 30 days — the intervals grow only when you have actually retained it, not because you answered quickly.",
    progressH2: "Where your progress is saved",
    progressP:
      "In your own browser, on this device. It is not an account: it does not sync between your phone and your laptop, and nobody else can see it. If you switch devices, use the transfer control inside the game — you download your progress as a file and load it back.",
    courseH2: "The game is not a substitute for a course",
    courseP:
      "You practise vocabulary and structures on your own, and that is all it does. Pronunciation, conversation and being corrected as you speak need a teacher. If you want to speak rather than just recognise words, start with a free trial lesson.",
    ctaCourses: "See the courses",
    ctaTrial: "Free trial lesson",
  },
} as const;

const Joaca = () => {
  const { lang } = useI18n();
  const c = COPY[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{JOACA_META.title}</title>
        <meta name="description" content={JOACA_META.description} />
        <link rel="canonical" href="https://centruldearabalibaneza.com/joc" />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={JOACA_META.title} />
        <meta property="og:description" content={JOACA_META.description} />
        <meta property="og:url" content="https://centruldearabalibaneza.com/joc" />
        <meta property="og:locale" content="ro_RO" />
      </Helmet>

      <Navbar />

      <main id="main-content" className="flex-1 pt-16">
        <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-content px-gutter pb-2 pt-6 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link to="/" className="transition-colors hover:text-foreground">{c.home}</Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="inline h-3.5 w-3.5 -mt-0.5" />
            </li>
            <li className="font-medium text-foreground" aria-current="page">{c.crumb}</li>
          </ol>
        </nav>

        <header className="mx-auto w-full max-w-content px-gutter pb-8 pt-4 text-center">
          <span className="text-sm font-medium text-primary mb-2 block">{c.eyebrow}</span>
          <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground mb-3">
            {c.h1}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {c.intro}
          </p>
          {c.langNote && (
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-3">
              {c.langNote}
            </p>
          )}
        </header>

        <div className="mx-auto w-full max-w-content px-gutter pb-section-sm">
          <YallaGame lang={lang} />
        </div>

        {/* Prose below the frame. A page whose only content sits inside an
            iframe reads as empty to a crawler: iframe content never counts
            toward the embedding page. */}
        <section className="w-full bg-cream">
          <div className="mx-auto grid w-full max-w-content gap-8 px-gutter py-section sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-bold text-foreground">{c.howH2}</h2>
              <p className="leading-relaxed text-muted-foreground">{c.howP}</p>
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-2xl font-bold text-foreground">{c.progressH2}</h2>
              <p className="leading-relaxed text-muted-foreground">{c.progressP}</p>
            </div>
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <h2 className="font-display text-2xl font-bold text-foreground">{c.courseH2}</h2>
              <p className="leading-relaxed text-muted-foreground">{c.courseP}</p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:flex-col xl:flex-row">
                <Button asChild>
                  <Link to="/cursuri-limba-araba">{c.ctaCourses}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/trial">{c.ctaTrial}</Link>
                </Button>
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

export default Joaca;
