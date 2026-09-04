import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FindYourTrackQuiz from "@/components/FindYourTrackQuiz";

const Quiz = () => {
  const { lang, t } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // t.quizTitle is the on-page headline ("În 30 de secunde îți recomandăm…").
  // Concatenated with the site name it ran to 84 characters, well past what a
  // SERP shows, and it overrode the shorter title the prerender writes.
  const title =
    lang === "en"
      ? "Free Arabic Level Test — Lebanese Arabic with Ibra"
      : "Test de nivel gratuit — Arabă Libaneză cu Ibra";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={t.quizDesc} />
        <link rel="canonical" href="https://centruldearabalibaneza.com/quiz" />
        <meta name="robots" content="index,follow" />
      </Helmet>
      <Navbar />
      <main id="main-content" className="flex-1 pt-20">
        <FindYourTrackQuiz />

        {/* Below the quiz: the page's only visible prose was the questions
            themselves, which left it thin for a page we want indexed. */}
        <section className="mx-auto mt-section w-full max-w-2xl space-y-8 px-gutter pb-section text-left">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.quizWhatH2}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.quizWhatP}</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.quizNotH2}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.quizNotP}</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.quizAfterH2}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.quizAfterP}</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Quiz;