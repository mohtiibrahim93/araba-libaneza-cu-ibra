import { useI18n } from "@/lib/i18n";
import instructorPhotoPng from "@/assets/instructor-photo.png";
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
        <div className="flex justify-center">
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-lg">
            <img
              src={instructorPhoto}
              alt="Ibra — instructor"
              className="w-full h-full object-cover"
            />
          </div>
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
