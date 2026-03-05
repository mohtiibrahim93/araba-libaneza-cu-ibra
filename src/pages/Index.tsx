import { I18nProvider } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GroupCourseForm from "@/components/GroupCourseForm";
import PrivateLessonsForm from "@/components/PrivateLessonsForm";
import KidsCourseForm from "@/components/KidsCourseForm";
import CedarTree from "@/components/CedarTree";

const PageContent = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background cedar-pattern">
      <Navbar />
      <HeroSection />
      
      {/* Lebanese stripe divider */}
      <div className="lebanese-stripe" />
      
      <GroupCourseForm />
      <PrivateLessonsForm />
      <KidsCourseForm />

      {/* Lebanese stripe divider */}
      <div className="lebanese-stripe" />

      <footer className="py-10 text-center border-t border-border">
        <CedarTree className="text-secondary mx-auto mb-3" size={32} />
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
