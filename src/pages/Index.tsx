import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SocialProofStrip from "@/components/SocialProofStrip";
import WhySection from "@/components/WhySection";
import InstructorSection from "@/components/InstructorSection";
import CulturalValueSection from "@/components/CulturalValueSection";
import ProgramsSection from "@/components/ProgramsSection";

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
        toast.success(t.paymentSuccessPrivate, {
          duration: 15000,
          action: {
            label: t.paymentSuccessPrivateCta,
            onClick: () => { window.location.href = "/booking?type=paid"; },
          },
        });
      } else {
        toast.success(t.paymentSuccessGeneric);
      }
      trackEvent("Purchase", { content_name: type || "course" });
      window.history.replaceState({}, "", "/");
    } else if (payment === "canceled") {
      toast.info(t.paymentCanceled);
      window.history.replaceState({}, "", "/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const homeTitle = t.homeSeoTitle;
  const homeDescription = t.homeSeoDescription;

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

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Centrul de Arabă Libaneză cu Ibra",
    description: homeDescription,
    url: "https://centruldearabalibaneza.com/",
    telephone: "+40763124514",
    email: "mohtiibrahim@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Raduga Creative Center, Strada Icoanei 80",
      addressLocality: "București",
      addressCountry: "RO",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "21",
    },
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      { name: "Curs de grup — Arabă Libaneză (A1–C2)", desc: "Curs de grup, 24+ lecții pe nivel, fizic în București sau online." },
      { name: "Lecții private — Arabă Libaneză", desc: "Lecții 1:1 cu profesor nativ, toate nivelurile, fizic sau online." },
      { name: "Cursuri pentru copii — Arabă Libaneză", desc: "Cursuri interactive pentru copii, fizic în București (online de la 10 ani)." },
    ].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: c.name,
        description: c.desc,
        inLanguage: "ar",
        provider: {
          "@type": "Organization",
          name: "Centrul de Arabă Libaneză cu Ibra",
          sameAs: "https://centruldearabalibaneza.com/",
        },
      },
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
        <script type="application/ld+json">{JSON.stringify(localBusinessJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>
      </Helmet>
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofStrip />
        <WhySection />
        <InstructorSection />
        <CulturalValueSection />
        <ProgramsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <MobileEnrollmentCTA />
      <CookieConsent />
    </div>
  );
};

const Index = () => <PageContent />;

export default Index;
