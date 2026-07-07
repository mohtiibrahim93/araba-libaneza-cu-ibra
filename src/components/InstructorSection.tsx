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
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[280px_1fr] gap-12 items-center">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3">
          <picture>
            <source srcSet={instructorPhotoWebp} type="image/webp" />
            <img
              src={instructorPhotoJpg}
              alt="Ibra — instructor"
              width={280}
              height={280}
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover rounded-2xl"
            />
          </picture>
          <a
            href="https://preply.com/en/tutor/471612"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
          >
            <Star className="w-3.5 h-3.5 fill-primary" />
            {t.instructorPreplyBadge}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Bio */}
        <div>
          <span className="text-sm font-medium text-primary mb-2 block">
            {t.instructorBadge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            {t.instructorTitle}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            {t.instructorBio1}
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {t.instructorBio2}
          </p>

          <div className="flex gap-6">
            {stats.map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-foreground">{val}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorSection;
