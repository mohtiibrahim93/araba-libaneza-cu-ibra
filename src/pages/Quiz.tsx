import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "@/lib/router-compat";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FindYourTrackQuiz from "@/components/FindYourTrackQuiz";

const Quiz = () => {
  const { lang, t } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // The head is the route's (src/lib/seoHead.ts, from QUIZ_META). Deliberately
  // NOT titled "test de nivel": /test-de-nivel is the page that runs the real
  // 24-question test, and this one recommends a course in 30 seconds. Titling
  // both for the same query made them compete while neither served it.

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <div className="bg-cream pt-24">
          <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-content px-gutter pt-8 text-sm text-muted-foreground">
            <Link to={lang === "en" ? "/en" : "/"} className="hover:text-foreground">{lang === "en" ? "Home" : "Acasă"}</Link>
            <ChevronRight className="mx-1 -mt-0.5 inline h-3.5 w-3.5" aria-hidden />
            <span className="text-foreground">{lang === "en" ? "Find your course" : "Găsește cursul potrivit"}</span>
          </nav>
        </div>
        <FindYourTrackQuiz />

        {/* Below the quiz: the page's only visible prose was the questions
            themselves, which left it thin for a page we want indexed. Three
            cards, the same pattern as the course pages. */}
        <section className="mx-auto w-full max-w-content px-gutter py-section">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { n: 1, h: t.quizWhatH2, p: t.quizWhatP },
              { n: 2, h: t.quizNotH2, p: t.quizNotP, levelLink: true },
              { n: 3, h: t.quizAfterH2, p: t.quizAfterP },
            ].map((card) => (
              <div key={card.n} className="rounded-2xl border border-[#E7E1D6] bg-card p-6 dark:border-border">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
                  {card.n}
                </span>
                <h2 className="font-display text-xl font-bold text-foreground">{card.h}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.p}</p>
                {/* The paragraph names the level test; this makes it reachable,
                    including for a crawler reading the page without running the
                    quiz. */}
                {card.levelLink && (
                  <p className="mt-3 text-sm">
                    <Link to="/test-de-nivel" className="font-semibold text-brand-green underline underline-offset-4">
                      {t.quizLevelTestCta}
                    </Link>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Quiz;