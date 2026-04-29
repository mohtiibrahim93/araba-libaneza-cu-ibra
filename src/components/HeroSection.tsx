import { useI18n } from "@/lib/i18n";
import { Users, GraduationCap, Clock, BookOpen } from "lucide-react";
import heroImg from "@/assets/hero-students.jpg";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="pt-28 pb-16 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              ⭐ {t.heroBadge}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-foreground mb-6">
            {t.heroTitle1}
            <br />
            <span className="text-primary">{t.heroTitle2}</span>
            <br />
            {t.heroTitle3}
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <a
              href="#inscriere"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90"
            >
              {t.heroCta} →
            </a>
            <a
              href="#courses"
              className="inline-flex items-center justify-center px-7 py-3 text-sm font-medium border border-border text-foreground rounded-lg transition-colors hover:bg-muted"
            >
              {t.heroExplore}
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {t.heroStat1}</span>
            <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> {t.heroStat2}</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {t.heroStat3}</span>
          </div>
        </div>

        {/* Right: Image with floating cards */}
        <div className="relative">
          <img
            src={heroImg}
            alt="Students learning Lebanese Arabic"
            className="w-full rounded-2xl shadow-lg object-cover aspect-[4/3]"
          />

          {/* Floating card: Lessons */}
          <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t.heroLessons}</p>
              <p className="text-xs text-muted-foreground">{t.heroComplete}</p>
            </div>
          </div>

          {/* Floating card: Students */}
          <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3">
            <p className="text-sm font-bold text-foreground">{t.heroJoin}</p>
            <p className="text-xs text-muted-foreground">{t.heroHappy}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
