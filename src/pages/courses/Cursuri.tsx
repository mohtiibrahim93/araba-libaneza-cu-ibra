import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import ProgramsSection from "@/components/ProgramsSection";
import { useI18n } from "@/lib/i18n";

const BASE_URL = "https://centruldearabalibaneza.com";

const Cursuri = () => {
  const { t } = useI18n();
  const canonical = `${BASE_URL}/cursuri`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t.cursuriMetaTitle}</title>
        <meta name="description" content={t.cursuriMetaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={t.cursuriMetaTitle} />
        <meta property="og:description" content={t.cursuriMetaDesc} />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <Navbar />

      <main className="pt-16">
        <nav
          aria-label={t.courseBreadcrumbCourses}
          className="max-w-6xl mx-auto px-6 pt-6 pb-2 text-xs text-muted-foreground"
        >
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                {t.courseBreadcrumbHome}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" />
            </li>
            <li className="text-foreground font-medium" aria-current="page">
              {t.courseBreadcrumbCourses}
            </li>
          </ol>
        </nav>

        <section className="max-w-6xl mx-auto px-6 pt-4 pb-2 text-center">
          <span className="text-sm font-medium text-primary mb-2 block">
            {t.programsBadge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">
            {t.cursuriH1}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.cursuriIntro}
          </p>
        </section>

        <ProgramsSection />
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <CookieConsent />
    </div>
  );
};

export default Cursuri;