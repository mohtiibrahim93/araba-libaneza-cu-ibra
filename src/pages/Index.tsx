import { I18nProvider, useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CulturalBand from "@/components/CulturalBand";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import GroupCourseForm from "@/components/GroupCourseForm";
import PrivateLessonsForm from "@/components/PrivateLessonsForm";
import KidsCourseForm from "@/components/KidsCourseForm";
import LebaneseCultureSection from "@/components/LebaneseCultureSection";
import CTASection from "@/components/CTASection";
import CedarTree from "@/components/CedarTree";

const PageContent = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CulturalBand />
      <FeaturesSection />
      <div className="flag-stripe" />
      <TestimonialsSection />
      <GroupCourseForm />
      <div className="flag-stripe" />
      <PrivateLessonsForm />
      <KidsCourseForm />
      <LebaneseCultureSection />
      <CTASection />
      <footer className="py-10 text-center border-t border-border">
        <CedarTree className="text-secondary/20 mx-auto mb-3" size={24} />
        <p className="text-xs text-muted-foreground">{t.footer}</p>
      </footer>
    </div>
  );
};

const Index = () => (
  <I18nProvider>
    <PageContent />
  </I18nProvider>
);

export default Index;
