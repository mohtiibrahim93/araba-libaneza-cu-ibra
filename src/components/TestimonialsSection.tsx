import { useI18n } from "@/lib/i18n";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const { t } = useI18n();

  const testimonials = [
    { text: t.testimonial1, author: t.testimonial1Author },
    { text: t.testimonial2, author: t.testimonial2Author },
    { text: t.testimonial3, author: t.testimonial3Author },
    { text: t.testimonial4, author: t.testimonial4Author },
  ];

  return (
    <section id="testimonials" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.testimonialsBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.testimonialsTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.testimonialsDesc}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {testimonials.map(({ text, author }, i) => (
            <div key={i} className="bg-background rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {author.charAt(0)}
                </div>
                <span className="text-sm font-medium text-foreground">{author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
