import { useI18n } from "@/lib/i18n";
import { Play, Star } from "lucide-react";

const TestimonialsSection = () => {
  const { t } = useI18n();

  return (
    <section className="py-20 px-6 parchment-bg relative overflow-hidden">
      {/* Subtle cedar pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L26 15 L22 12 L25 18 L20 16 L24 22 L18 20 L22 26 L28 24 V40 H32 V24 L38 26 L42 20 L36 22 L40 16 L35 18 L38 12 L34 15 Z' fill='%231F6F4A'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-14 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.testimonialsTitle}
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Video testimonial card */}
          <div
            className="rounded-2xl overflow-hidden bg-white border border-border"
            style={{ boxShadow: "0 8px 32px hsla(25, 20%, 15%, 0.1)" }}
          >
            <div className="aspect-video bg-muted flex items-center justify-center relative group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-7 h-7 text-primary-foreground ml-1" />
              </div>
              <p className="absolute bottom-3 left-4 text-xs text-muted-foreground">
                {t.testimonialVideoLabel}
              </p>
            </div>
            <div className="p-5">
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "{t.testimonial1}"
              </p>
              <p className="text-sm font-semibold mt-3">{t.testimonial1Author}</p>
            </div>
          </div>

          {/* Text testimonials */}
          <div className="space-y-6">
            {[
              { text: t.testimonial2, author: t.testimonial2Author },
              { text: t.testimonial3, author: t.testimonial3Author },
            ].map(({ text, author }) => (
              <div
                key={author}
                className="rounded-2xl p-6 bg-white border border-border"
                style={{ boxShadow: "0 4px 24px hsla(25, 20%, 15%, 0.07)" }}
              >
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">"{text}"</p>
                <p className="text-sm font-semibold mt-3">{author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
