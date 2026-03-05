import { I18nProvider, useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GroupCourseForm from "@/components/GroupCourseForm";
import PrivateLessonsForm from "@/components/PrivateLessonsForm";
import KidsCourseForm from "@/components/KidsCourseForm";
import CedarTree from "@/components/CedarTree";

const PageContent = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <GroupCourseForm />
      <div className="flag-stripe" />
      <PrivateLessonsForm />
      <KidsCourseForm />
      <div className="flag-stripe" />
      <footer className="py-12 text-center">
        <CedarTree className="text-secondary/30 mx-auto mb-4" size={28} />
        <p className="text-sm text-muted-foreground">{t.footer}</p>
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
