import { useI18n } from "@/lib/i18n";
import { Users, GraduationCap, Clock, BookOpen, Star, ShieldCheck, BadgeCheck } from "lucide-react";
import heroImg from "@/assets/hero-lebanon-cedar.jpg";
import AnchorLink from "@/components/AnchorLink";

const WHATSAPP_URL =
  "https://wa.me/40763124514?text=" +
  encodeURIComponent("Salut! Sunt interesat(ă) de cursurile de arabă libaneză.");

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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-background text-foreground text-sm font-medium">
              {t.heroPill}
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
            <AnchorLink
              to="#inscriere"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90"
            >
              {t.heroCta} →
            </AnchorLink>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
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

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-primary" /> {t.heroTrustRating}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> {t.heroTrustStudents}</span>
            <span className="inline-flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-primary" /> {t.heroTrustVerified}</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> {t.heroTrustSecure}</span>
          </div>
        </div>

        {/* Right: Lebanese cedar illustration with floating cards */}
        <div className="relative">
          <div className="w-full rounded-2xl bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-border/60 shadow-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
            <img
              src={heroImg}
              alt="Cedrul libanez — simbolul Libanului"
              width={1024}
              height={1024}
              className="w-full h-full object-contain p-4"
            />
          </div>

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
