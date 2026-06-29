import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Users, User, Baby, GraduationCap, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import { useI18n } from "@/lib/i18n";
import groupImg from "@/assets/group-course.jpg";

const BASE_URL = "https://centruldearabalibaneza.com";
const WHATSAPP_URL = "https://wa.me/40763124514";

const Cursuri = () => {
  const { t } = useI18n();
  const canonical = `${BASE_URL}/cursuri`;

  const audiences = [
    {
      to: "/cursuri/adulti",
      icon: GraduationCap,
      title: t.trackAdultiTitle,
      desc: t.trackAdultiDesc,
      available: true,
    },
    {
      to: "/cursuri/tineri",
      icon: User,
      title: t.trackTineriTitle,
      desc: t.trackTineriDesc,
      available: false,
    },
    {
      to: "/cursuri/copii",
      icon: Baby,
      title: t.trackCopiiTitle,
      desc: t.trackCopiiDesc,
      available: true,
    },
  ];

  const programs = [
    { to: "/cursuri/grup", icon: Users, label: t.courseGrupH1 },
    { to: "/cursuri/private", icon: User, label: t.coursePrivateH1 },
    { to: "/cursuri/copii", icon: Baby, label: t.courseCopiiH1 },
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
        <nav className="max-w-6xl mx-auto px-6 pt-6 pb-2 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link to="/" className="hover:text-foreground">{t.courseBreadcrumbHome}</Link></li>
            <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
            <li className="text-foreground font-medium" aria-current="page">{t.courseBreadcrumbCourses}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-4 pb-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                {t.programsBadge}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                {t.cursuriH1}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">{t.cursuriIntro}</p>
              <div className="flex flex-wrap gap-3">
                <a href="#audience" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  {t.cursuriPickAudience}
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors">
                  <MessageCircle className="w-4 h-4 text-primary" /> WhatsApp
                </a>
              </div>
            </div>
            <div className="order-first lg:order-last">
              <img src={groupImg} alt={t.cursuriH1} width={1200} height={800} loading="eager" className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl border border-border shadow-sm" />
            </div>
          </div>
        </section>

        {/* Audience picker — primary */}
        <section id="audience" className="scroll-mt-24 max-w-6xl mx-auto px-6 pb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.cursuriPickAudience}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {audiences.map(({ to, icon: Icon, title, desc, available }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                  {!available && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {t.trackInPrepBadge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline underline-offset-4">
                  {t.trackViewLink}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Secondary — direct program picker */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t.cursuriPickProgram}</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {programs.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-xl border border-border bg-background p-4 hover:border-primary/50 transition-colors flex items-center justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <CookieConsent />
    </div>
  );
};

export default Cursuri;