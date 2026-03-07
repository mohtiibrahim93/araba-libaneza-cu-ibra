import { useI18n } from "@/lib/i18n";
import cultureCoffee from "@/assets/culture-coffee.png";
import cultureMezze from "@/assets/culture-mezze.png";
import cultureCedar from "@/assets/culture-cedar.png";

const LebaneseCultureSection = () => {
  const { t } = useI18n();

  const dishes = [
    { img: cultureMezze, label: "Hummus & Tabbouleh" },
    { img: cultureCoffee, label: t.cultureCoffee },
    { img: cultureCedar, label: t.cultureCedar },
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-secondary font-semibold mb-2">—</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          {t.cultureTitle}
        </h2>
        <p className="text-muted-foreground mb-12 max-w-md mx-auto text-sm">
          {t.cultureDesc}
        </p>

        <div className="flex justify-center items-end gap-10 md:gap-16 flex-wrap">
          {dishes.map(({ img, label }) => (
            <div key={label} className="flex flex-col items-center gap-3 group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-lg bg-card border border-border flex items-center justify-center p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                <img src={img} alt={label} className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LebaneseCultureSection;
