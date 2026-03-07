import { useI18n } from "@/lib/i18n";
import { Play, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const { t } = useI18n();

  const testimonials = [
    { text: t.testimonial1, author: t.testimonial1Author },
    { text: t.testimonial2, author: t.testimonial2Author },
    { text: t.testimonial3, author: t.testimonial3Author },
  ];

  return (
    <section className="py-20 px-6 bg-foreground text-background">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold text-center mb-2">—</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          {t.testimonialsTitle}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Video card */}
          <div className="rounded-lg overflow-hidden bg-background/5 border border-background/10 cursor-pointer group">
            <div className="aspect-video bg-background/10 flex items-center justify-center relative">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
              </div>
              <p className="absolute bottom-2 left-3 text-xs text-background/50">
                {t.testimonialVideoLabel}
              </p>
            </div>
            <div className="p-5">
              <p className="text-sm text-background/70 italic leading-relaxed">
                "{testimonials[0].text}"
              </p>
              <p className="text-sm font-semibold mt-3 text-background/90">{testimonials[0].author}</p>
            </div>
          </div>

          {/* Text testimonials */}
          {testimonials.slice(1).map(({ text, author }) => (
            <div
              key={author}
              className="rounded-lg p-6 bg-background/5 border border-background/10 flex flex-col"
            >
              <Quote className="w-6 h-6 text-primary/60 mb-3" />
              <p className="text-sm text-background/70 italic leading-relaxed flex-1">"{text}"</p>
              <p className="text-sm font-semibold mt-4 text-background/90">{author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
