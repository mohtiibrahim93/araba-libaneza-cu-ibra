import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, GraduationCap, User, Baby, Sparkles, Building2, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import { useI18n } from "@/lib/i18n";

const BASE_URL = "https://centruldearabalibaneza.com";
const WHATSAPP_URL = "https://wa.me/40763124514";

const Cursuri = () => {
  const { t } = useI18n();
  const canonical = `${BASE_URL}/cursuri`;

  const audiences = [
    { to: "/cursuri/adulti", icon: GraduationCap, title: t.trackAdultiTitle, desc: t.trackAdultiDesc, inPrep: false },
    { to: "/cursuri/tineri", icon: User, title: t.trackTineriTitle, desc: t.trackTineriDesc, inPrep: true },
    { to: "/cursuri/copii", icon: Baby, title: t.trackCopiiTitle, desc: t.trackCopiiDesc, inPrep: false },
  ];

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

        {/* Audience cards */}
        <section className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">{t.cursuriPickAudience}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {audiences.map(({ to, icon: Icon, title, desc, inPrep }) => (
              <Link
                key={to}
                to={to}
                aria-label={`${t.trackViewLink}: ${title}`}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                  {inPrep && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {t.trackInPrepBadge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline underline-offset-4">
                  {t.trackViewLink}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Don't know your level */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t.dontKnowLevelTitle}</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{t.dontKnowLevelDesc}</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link to="/quiz" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
                <Sparkles className="w-5 h-5 text-primary mb-2" />
                <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptQuizTitle}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptQuizDesc}</p>
                <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
                  {t.dontKnowOptQuizTitle} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              <Link to="/trial" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
                <Building2 className="w-5 h-5 text-primary mb-2" />
                <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptTestTitle}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptTestDesc}</p>
                <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
                  {t.dontKnowOptTestTitle} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
                <MessageCircle className="w-5 h-5 text-primary mb-2" />
                <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptWhatsAppTitle}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptWhatsAppDesc}</p>
                <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
                  WhatsApp <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </a>
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

export default Cursuri;