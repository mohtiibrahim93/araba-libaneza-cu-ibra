import { useI18n } from "@/lib/i18n";

const TestimonialsSection = () => {
  const { t } = useI18n();

  const testimonials = [
    { text: t.testimonial1, author: t.testimonial1Author },
    { text: t.testimonial2, author: t.testimonial2Author },
    { text: t.testimonial3, author: t.testimonial3Author },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground font-medium text-center mb-4">—</p>
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 tracking-tight">
          {t.testimonialsTitle}
        </h2>

        <div className="space-y-12">
          {testimonials.map(({ text, author }, i) => (
            <blockquote key={i} className="max-w-2xl mx-auto text-center">
              <p className="text-xl md:text-2xl font-light leading-relaxed text-foreground/80 italic" style={{ fontFamily: "var(--font-display)" }}>
                "{text}"
              </p>
              <cite className="block mt-4 text-[13px] text-muted-foreground not-italic font-medium tracking-wide">
                — {author}
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
