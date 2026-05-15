import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { I18nProvider, useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhySection from "@/components/WhySection";
import InstructorSection from "@/components/InstructorSection";
import ProgramsSection from "@/components/ProgramsSection";
import CulturalValueSection from "@/components/CulturalValueSection";
import PricingSection from "@/components/PricingSection";
import BookingSection from "@/components/BookingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import MobileEnrollmentCTA from "@/components/MobileEnrollmentCTA";
import { toast } from "sonner";
import { initTracking, trackEvent } from "@/lib/tracking";

const PageContent = () => {
  const { lang, t } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.siteTitle;
  }, [lang, t.siteTitle]);

  useEffect(() => {
    // Init tracking if consent was previously given
    initTracking();

    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const type = params.get("type");
    if (payment === "success") {
      if (type === "private") {
        // Private lessons are paid → next step is to pick a slot in the
        // native scheduler. Send them to the booking page (paid event).
        toast.success("Plata reușită! 🎉 Programează-ți lecția acum.", {
          duration: 15000,
          action: {
            label: "Programează",
            onClick: () => { window.location.href = "/booking?type=paid"; },
          },
        });
      } else {
        toast.success("Plata a fost procesată cu succes! 🎉 Te vom contacta în curând.");
      }
      trackEvent("Purchase", { content_name: type || "course" });
      window.history.replaceState({}, "", "/");
    } else if (payment === "canceled") {
      toast.info("Plata a fost anulată. Poți încerca din nou oricând.");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const homeTitle = lang === "ro"
    ? "Cursuri de Arabă Libaneză în București și Online — cu Ibra"
    : "Lebanese Arabic Courses in Bucharest & Online — with Ibra";
  const homeDescription = lang === "ro"
    ? "Învață arabă libaneză cu profesor nativ. Cursuri de grup, private și pentru copii — fizic în București sau online. Toate nivelurile CEFR (A1–C2)."
    : "Learn Lebanese Arabic with a native instructor. Group, private, and kids courses — in person in Bucharest or online. All CEFR levels (A1–C2).";

  const faqEntries = [
    { q: t.faq1Q, a: t.faq1A }, { q: t.faq2Q, a: t.faq2A }, { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A }, { q: t.faq5Q, a: t.faq5A }, { q: t.faq6Q, a: t.faq6A },
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{homeTitle}</title>
        <meta name="description" content={homeDescription} />
        <link rel="canonical" href="https://centruldearabalibaneza.com/" />
        <meta property="og:title" content={homeTitle} />
        <meta property="og:description" content={homeDescription} />
        <meta property="og:url" content="https://centruldearabalibaneza.com/" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <Navbar />
      <HeroSection />
      <WhySection />
      <InstructorSection />
      <ProgramsSection />
      <CulturalValueSection />
      <PricingSection />
      <BookingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <MobileEnrollmentCTA />
      <CookieConsent />
    </div>
  );
};

const Index = () => (
  <I18nProvider>
    <PageContent />
  </I18nProvider>
);

export default Index;
