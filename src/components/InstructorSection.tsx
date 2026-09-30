import { useI18n } from "@/lib/i18n";
import { Star, ExternalLink } from "lucide-react";
import instructorPhotoJpg from "@/assets/instructor-photo.jpg";
import instructorPhotoWebp from "@/assets/instructor-photo.webp";

const InstructorSection = () => {
  const { t } = useI18n();

  const stats = [
    { val: t.instructorStat1, label: t.instructorStat1Label },
    { val: t.instructorStat2, label: t.instructorStat2Label },
    { val: t.instructorStat3, label: t.instructorStat3Label },
    // The full course, moved here from a card on the hero photo: it is a fact
    // about what Ibra teaches, so it sits with his other figures.
    { val: t.heroLessons, label: t.heroComplete },
  ];

  return (
    <section className="py-section px-gutter bg-cream">
      <div className="w-full max-w-content mx-auto grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-cols-[420px_1fr] gap-10 md:gap-14 items-center rounded-[2rem] border border-border/60 bg-background p-6 sm:p-10 lg:p-12 shadow-xs">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3">
          <picture>
            <source srcSet={instructorPhotoWebp} type="image/webp" />
            <img
              src={instructorPhotoJpg}
              alt="Ibra — profesor nativ de arabă libaneză"
              width={420}
              height={420}
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover rounded-3xl"
            />
          </picture>
          <a
            href="https://preply.com/en/tutor/471612"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
          >
            <Star className="w-3.5 h-3.5 fill-primary" />
            {t.instructorPreplyBadge}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Bio */}
        <div>
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
            {t.instructorBadge}
          </span>
          <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-4">
            {t.instructorTitle}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            {t.instructorBio1}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {t.instructorBio2}
          </p>

          <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-10">
            {stats.map(({ val, label }) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">{val}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;
