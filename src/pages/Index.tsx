import { I18nProvider, useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import GroupCourseForm from "@/components/GroupCourseForm";
import PrivateLessonsForm from "@/components/PrivateLessonsForm";
import KidsCourseForm from "@/components/KidsCourseForm";
import CTASection from "@/components/CTASection";

const PageContent = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div className="flag-stripe" />
      <FeaturesSection />
      <div className="flag-stripe" />
      <TestimonialsSection />
      <div className="flag-stripe" />
      <GroupCourseForm />
      <PrivateLessonsForm />
      <KidsCourseForm />
      <div className="flag-stripe" />
      <CTASection />
      <footer className="py-10 text-center border-t border-border">
        <p className="text-[12px] text-muted-foreground tracking-wide">{t.footer}</p>
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
