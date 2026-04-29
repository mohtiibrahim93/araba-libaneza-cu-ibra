import { useEffect } from "react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhySection from "@/components/WhySection";
import InstructorSection from "@/components/InstructorSection";
import ProgramsSection from "@/components/ProgramsSection";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import GroupCourseForm from "@/components/GroupCourseForm";
import PrivateLessonsForm from "@/components/PrivateLessonsForm";
import KidsCourseForm from "@/components/KidsCourseForm";
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
    if (payment === "success") {
      toast.success("Plata a fost procesată cu succes! 🎉 Te vom contacta în curând.");
      trackEvent("Purchase", { content_name: "course" });
      window.history.replaceState({}, "", "/");
    } else if (payment === "canceled") {
      toast.info("Plata a fost anulată. Poți încerca din nou oricând.");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <WhySection />
      <InstructorSection />
      <ProgramsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <GroupCourseForm />
      <PrivateLessonsForm />
      <KidsCourseForm />
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
