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
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.cultureTitle}
        </h2>
        <p className="text-center text-muted-foreground mb-14 max-w-lg mx-auto">
          {t.cultureDesc}
        </p>

        <div className="flex justify-center items-end gap-8 md:gap-16 flex-wrap">
          {dishes.map(({ img, label }) => (
            <div key={label} className="flex flex-col items-center gap-4 group">
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white border border-border flex items-center justify-center p-4 transition-all duration-300 group-hover:-translate-y-2"
                style={{ boxShadow: "0 4px 24px hsla(25, 20%, 15%, 0.07)" }}
              >
                <img src={img} alt={label} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LebaneseCultureSection;
