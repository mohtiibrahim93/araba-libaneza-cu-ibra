import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ActiveCoursesBanner from "@/components/ActiveCoursesBanner";
import SocialProofStrip from "@/components/SocialProofStrip";
import StepsSection from "@/components/StepsSection";
import WhySection from "@/components/WhySection";
import CulturalValueSection from "@/components/CulturalValueSection";
import ResourcesTeaser from "@/components/ResourcesTeaser";
import InstructorSection from "@/components/InstructorSection";
import ProgramsSection from "@/components/ProgramsSection";

import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import MobileEnrollmentCTA from "@/components/MobileEnrollmentCTA";
import { toast } from "sonner";
import { trackEvent } from "@/lib/tracking";
import { COURSE_PROVIDER, courseInstances, GROUP_WEEKLY_WORKLOAD, PRIVATE_LESSON_WORKLOAD } from "@/lib/courseSchema";

const PageContent = () => {
  const { lang, t } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.siteTitle;
  }, [lang, t.siteTitle]);

  useEffect(() => {
    // Analytics consent is handled by the Adopt CMP (Google
    // Consent Mode); here we only handle post-payment redirect toasts.
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
      // No purchase event here. This branch fires on the ?payment=success
      // redirect parameter, which is a URL anyone can type and which arrives
      // before anything has confirmed the charge — and the same payment is
      // already reported, once and verified, by /payment-status and
      // /thank-you. Sending it here made every real sale count twice.
      window.history.replaceState({}, "", "/");
    } else if (payment === "canceled") {
      toast.info(t.paymentCanceled);
      window.history.replaceState({}, "", "/");
    }

    // Return from the 0-lei trial card-on-file Stripe setup page.
    const trialCard = params.get("trial_card");
    if (trialCard === "saved") {
      toast.success(
        lang === "en"
          ? "Card saved — your free trial spot is confirmed. Nothing was charged."
          : "Cardul a fost salvat — locul tău la proba gratuită e confirmat. Nu s-a încasat nimic.",
        { duration: 10000 },
      );
      trackEvent("TrialCardSaved");
      window.history.replaceState({}, "", "/");
    } else if (trialCard === "canceled") {
      toast.info(
        lang === "en"
          ? "Card step skipped — your trial booking still stands."
          : "Ai sărit peste pasul cu cardul — programarea ta la probă rămâne valabilă.",
      );
      window.history.replaceState({}, "", "/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const homeTitle = t.homeSeoTitle;
  const homeDescription = t.homeSeoDescription;

  // FAQPage JSON-LD comes from FAQSection (generated from the rendered FAQ
  // content) — emitting a second one here made the page invalid for FAQ rich
  // results, so this page only owns LocalBusiness + the course list.
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://centruldearabalibaneza.com/#localbusiness",
    // Ties this location to the Organization node declared once in index.html.
    // Without the link the two read as separate businesses that happen to share
    // a name, address and phone number.
    parentOrganization: { "@id": "https://centruldearabalibaneza.com/#organization" },
    name: "Centrul de Arabă Libaneză cu Ibra",
    description: homeDescription,
    url: "https://centruldearabalibaneza.com/",
    image: "https://centruldearabalibaneza.com/og-image.png",
    telephone: "+40763124514",
    email: "marhaba@centruldearabalibaneza.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Raduga Creative Center, Strada Icoanei 80",
      addressLocality: "București",
      addressCountry: "RO",
    },
    // No aggregateRating here. The 5.0 / 21 reviews are real but they live on
    // Preply, and Google's review-snippet guidelines say not to aggregate
    // ratings from another site into your own — the markup must describe
    // reviews shown on this page. Breaking that risks a manual action against
    // the whole domain. The rating stays visible to visitors, attributed and
    // linked to the Preply profile, in SocialProofStrip and TestimonialsSection.
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      lang === "en"
        ? { url: "/cursuri/grup", name: "Group course — Lebanese Arabic (A1–C2)", desc: "Group course, 26–80 lessons per level (90 min, twice a week), in person in Bucharest or online." }
        : { url: "/cursuri/grup", name: "Curs de grup — Arabă Libaneză (A1–C2)", desc: "Curs de grup, 26–80 de lecții pe nivel (90 min, de 2 ori pe săptămână), fizic în București sau online." },
      lang === "en"
        ? { url: "/cursuri/private", name: "Private lessons — Lebanese Arabic", desc: "1:1 lessons with a native teacher, all levels, in person or online." }
        : { url: "/cursuri/private", name: "Lecții private — Arabă Libaneză", desc: "Lecții 1:1 cu profesor nativ, toate nivelurile, fizic sau online." },
      lang === "en"
        ? { url: "/cursuri/copii", name: "Kids courses — Lebanese Arabic", desc: "Interactive courses for children, in person in Bucharest (online from age 10)." }
        : { url: "/cursuri/copii", name: "Cursuri pentru copii — Arabă Libaneză", desc: "Cursuri interactive pentru copii, fizic în București (online de la 10 ani)." },
    ].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      // A Course in a carousel has to be reachable: Google rejects the list
      // when the items carry no URL, which is what "Google rich results
      // validation error" on the homepage was about. The delivery mode lives
      // on hasCourseInstance, not on Course — see src/lib/courseSchema.ts.
      item: {
        "@type": "Course",
        url: `https://centruldearabalibaneza.com${c.url}`,
        name: c.name,
        description: c.desc,
        inLanguage: lang === "en" ? "en" : "ro",
        provider: COURSE_PROVIDER,
        hasCourseInstance: courseInstances(
          c.url === "/cursuri/private"
            ? { workload: PRIVATE_LESSON_WORKLOAD }
            : { workload: GROUP_WEEKLY_WORKLOAD, repeatFrequency: "Weekly" },
        ),
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{homeTitle}</title>
        <meta name="description" content={homeDescription} />
        <link rel="canonical" href="https://centruldearabalibaneza.com/" />
        {/* No hreflang. The homepage has no translation: /en/learn-lebanese-arabic
            is the English twin of /cursuri-araba, and names that page back. The
            homepage used to claim it anyway, which made the annotation one-way
            and left the whole group invalid. The three-language cluster lives on
            /cursuri-araba — see src/lib/hreflangCluster.ts. */}
        <meta property="og:title" content={homeTitle} />
        <meta property="og:description" content={homeDescription} />
        <meta property="og:url" content="https://centruldearabalibaneza.com/" />
        {/* One-URL bilingual site (client-side toggle): hreflang needs
            per-language URLs, so it doesn't apply here. og:locale plus the
            dynamic <html lang> (set in i18n.tsx) are the correct signals. */}
        <meta property="og:locale" content={lang === "en" ? "en_US" : "ro_RO"} />
        <meta property="og:locale:alternate" content={lang === "en" ? "ro_RO" : "en_US"} />
        <script type="application/ld+json">{JSON.stringify(localBusinessJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>
      </Helmet>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <ActiveCoursesBanner />
        <SocialProofStrip />
        <StepsSection />
        <ProgramsSection />
        <WhySection />
        <CulturalValueSection />
        <ResourcesTeaser />
        <TestimonialsSection />
        <InstructorSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <MobileEnrollmentCTA />
    </div>
  );
};

const Index = () => <PageContent />;

export default Index;
