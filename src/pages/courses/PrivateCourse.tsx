import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, UserRound, CalendarClock, Sparkles, Wallet, ListChecks, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useI18n } from "@/lib/i18n";

const BASE_URL = "https://centruldearabalibaneza.com";

const PrivateCourse = () => {
  const { lang } = useI18n();
  const canonical = `${BASE_URL}/cursuri/privat`;
  const en = lang === "en";

  const blocks: { icon: typeof UserRound; title: { ro: string; en: string }; body: { ro: string; en: string } }[] = [
    { icon: UserRound, title: { ro: "Pentru cine este", en: "Who it's for" }, body: { ro: "Pentru cine vrea progres rapid, are un obiectiv precis (conversație, business, călătorie) sau un program care nu se potrivește cu grupele fixe.", en: "For anyone who wants fast progress, has a specific goal (conversation, business, travel) or a schedule that doesn't fit fixed groups." } },
    { icon: CalendarClock, title: { ro: "Cum se desfășoară", en: "How it works" }, body: { ro: "Lecții 1:1 cu profesor nativ, online pe Zoom sau fizic în București. O ședință durează de obicei 60–90 de minute, cu frecvența pe care o alegi (recomandat 1–2 pe săptămână).", en: "1-on-1 lessons with a native teacher, online on Zoom or in person in Bucharest. A session is usually 60–90 minutes, at the frequency you choose (1–2 per week recommended)." } },
    { icon: Sparkles, title: { ro: "Programă adaptată", en: "Tailored curriculum" }, body: { ro: "Ritmul și conținutul se ajustează după nivelul și obiectivele tale — nu urmezi un calendar fix ca la grupe.", en: "Pace and content adapt to your level and goals — no fixed calendar like group courses." } },
    { icon: GraduationCap, title: { ro: "Privat vs. grup", en: "Private vs. group" }, body: { ro: "La grup înveți alături de alți 4–10 cursanți, la un preț mai mic și pe un calendar fix. Privat înseamnă atenție 100% și flexibilitate, la un preț per lecție.", en: "In a group you learn alongside 4–10 others, at a lower price and on a fixed calendar. Private means 100% attention and flexibility, at a per-lesson price." } },
    { icon: Wallet, title: { ro: "Preț", en: "Price" }, body: { ro: "150 LEI / lecție. Oferta finală se stabilește în funcție de frecvență și durată; îți confirmăm totul înainte să începi.", en: "150 LEI / lesson. The final offer depends on frequency and duration; we confirm everything before you start." } },
    { icon: ListChecks, title: { ro: "Procesul", en: "The process" }, body: { ro: "Completezi formularul de mai jos, te contactăm în cel mult o zi lucrătoare, stabilim programul și prima lecție.", en: "Fill in the form below, we contact you within one business day, then agree on the schedule and first lesson." } },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{en ? "Private Lebanese Arabic Lessons (1-on-1) | Bucharest & Online" : "Lecții private de arabă libaneză (1:1) | București & Online"}</title>
        <meta name="description" content={en ? "Private 1-on-1 Lebanese Arabic lessons with a native teacher — online or in Bucharest, tailored pace and schedule. Request a private lesson." : "Lecții private 1:1 de arabă libaneză cu profesor nativ — online sau în București, ritm și program adaptate. Solicită o lecție privată."} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={en ? "Private Lebanese Arabic Lessons (1-on-1)" : "Lecții private de arabă libaneză (1:1)"} />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <Navbar />

      <main id="main-content" className="pt-16">
        <div className="mx-auto max-w-4xl px-6">
          <nav aria-label="Breadcrumb" className="pt-6 pb-2 text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link to="/" className="hover:text-foreground">{en ? "Home" : "Acasă"}</Link></li>
              <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
              <li><Link to="/cursuri" className="hover:text-foreground">{en ? "Courses" : "Cursuri"}</Link></li>
              <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
              <li className="text-foreground font-medium" aria-current="page">{en ? "Private" : "Privat"}</li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{en ? "Private lessons, tailored to you" : "Lecții private, adaptate ție"}</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{en ? "1-on-1 with a native teacher, at your pace and on your schedule — online or in person in Bucharest." : "1:1 cu profesor nativ, în ritmul și programul tău — online sau fizic în București."}</p>
          </header>

          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            {blocks.map(({ icon: Icon, title, body }) => (
              <div key={title.ro} className="rounded-2xl border border-border bg-card p-5">
                <Icon className="mb-2 h-5 w-5 text-primary" />
                <h2 className="mb-1 text-base font-bold text-foreground">{en ? title.en : title.ro}</h2>
                <p className="text-sm text-muted-foreground">{en ? body.en : body.ro}</p>
              </div>
            ))}
          </div>

          <section id="solicita" className="mb-12 scroll-mt-20 rounded-2xl border border-border bg-card p-5 sm:p-8">
            <h2 className="mb-1 text-2xl font-bold text-foreground">{en ? "Request a private lesson" : "Solicită un curs privat"}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{en ? "Tell us your goal and availability — we'll reply within one business day." : "Spune-ne obiectivul și disponibilitatea — răspundem în cel mult o zi lucrătoare."}</p>
            <RegistrationFormSection defaultCourseType="private" lessonType="private" lockCourseType embedded />
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default PrivateCourse;
