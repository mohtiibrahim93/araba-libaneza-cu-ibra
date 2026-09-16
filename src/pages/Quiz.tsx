import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/lib/i18n";
import { QUIZ_META } from "@/lib/pageMeta";
import { Link } from "@/lib/router-compat";
import { canonicalPath } from "@/lib/languageRoutes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FindYourTrackQuiz from "@/components/FindYourTrackQuiz";

const Quiz = () => {
  const { lang, t } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Deliberately NOT "test de nivel": /test-de-nivel is the page that runs the
  // real 24-question test, and this one recommends a course in 30 seconds.
  // Titling both for the same query made them compete while neither served it.
  // From QUIZ_META, which src/lib/seoHead.ts reads too: this head used to be
  // written here and again there, and the two had already drifted — the
  // server-rendered one still promised a two-minute level test.
  const meta = QUIZ_META[lang];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`https://centruldearabalibaneza.com${canonicalPath("/quiz", lang)}`} />
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
            {/* The paragraph names the level test; this makes it reachable,
                including for a crawler reading the page without running the
                quiz. */}
            <p className="text-muted-foreground leading-relaxed">
              <Link to="/test-de-nivel" className="font-medium text-primary underline underline-offset-4">
                {t.quizLevelTestCta}
              </Link>
            </p>
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