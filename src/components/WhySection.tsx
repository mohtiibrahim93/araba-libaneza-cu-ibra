import { useI18n } from "@/lib/i18n";
import { Check } from "lucide-react";

const WhySection = () => {
  const { t } = useI18n();

  const points = [t.why1, t.why2, t.why3, t.why4, t.why5];

  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { val: "30+", label: t.heroStat1.replace("30+ ", "") },
            { val: "50+", label: "Reviews" },
            { val: "4.9", label: "Rating" },
          ].map(({ val, label }) => (
            <div key={val} className="bg-muted rounded-2xl p-6 text-center">
              <p className="text-3xl font-extrabold text-foreground">{val}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div>
          <span className="text-sm font-medium text-primary mb-2 block">{t.whyBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">{t.whyTitle}</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">{t.whyDesc}</p>

          <ul className="space-y-3">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
