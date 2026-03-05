import HeroSection from "@/components/HeroSection";
import GroupCourseForm from "@/components/GroupCourseForm";
import PrivateLessonsForm from "@/components/PrivateLessonsForm";
import KidsCourseForm from "@/components/KidsCourseForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <GroupCourseForm />
      <PrivateLessonsForm />
      <KidsCourseForm />

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>© 2026 Raduga — Cursuri de Arabă Libaneză</p>
      </footer>
    </div>
  );
};

export default Index;
