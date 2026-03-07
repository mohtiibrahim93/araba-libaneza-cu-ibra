import { useI18n } from "@/lib/i18n";
import cultureCoffee from "@/assets/culture-coffee.png";
import cultureCedar from "@/assets/culture-cedar.png";
import cultureArabic from "@/assets/culture-arabic.png";
import cultureMezze from "@/assets/culture-mezze.png";

const CulturalBand = () => {
  const { t } = useI18n();

  const items = [
    { img: cultureCoffee, label: t.cultureCoffee },
    { img: cultureCedar, label: t.cultureCedar },
    { img: cultureArabic, label: t.cultureArabic },
    { img: cultureMezze, label: t.cultureMezze },
  ];

  return (
    <section className="py-16 px-6 bg-card border-y border-border">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-semibold mb-2">—</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-12">
          {t.culturalTitle}
        </h2>
        <div className="flex justify-center items-end gap-12 md:gap-20 flex-wrap">
          {items.map(({ img, label }) => (
            <div key={label} className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-105">
                <img
                  src={img}
                  alt={label}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium tracking-wide">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CulturalBand;
