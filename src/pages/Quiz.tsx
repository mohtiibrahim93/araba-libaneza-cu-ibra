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

  const title = `${t.quizTitle} — ${t.siteTitle}`;

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