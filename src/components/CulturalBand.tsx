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
    <section className="py-16 px-6 parchment-bg">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-2xl md:text-3xl font-bold mb-12 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.culturalTitle}
        </h2>
        <div className="flex justify-center items-end gap-10 md:gap-16 flex-wrap">
          {items.map(({ img, label }) => (
            <div key={label} className="flex flex-col items-center gap-3 group">
              <img
                src={img}
                alt={label}
                className="w-20 h-20 md:w-24 md:h-24 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="text-xs md:text-sm text-muted-foreground font-medium">
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
