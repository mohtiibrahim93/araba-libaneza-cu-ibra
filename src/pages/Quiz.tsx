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
      <main className="flex-1 pt-20">
        <FindYourTrackQuiz />
      </main>
      <Footer />
    </div>
  );
};

export default Quiz;