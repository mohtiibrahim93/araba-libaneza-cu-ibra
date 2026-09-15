import { useI18n } from "@/lib/i18n";
import { Star, ExternalLink } from "lucide-react";

const TestimonialsSection = () => {
  const { t } = useI18n();

  const testimonials = [
    { text: t.testimonial1, author: t.testimonial1Author },
    { text: t.testimonial2, author: t.testimonial2Author },
    { text: t.testimonial3, author: t.testimonial3Author },
    { text: t.testimonial4, author: t.testimonial4Author },
    { text: t.testimonial5, author: t.testimonial5Author },
    { text: t.testimonial6, author: t.testimonial6Author },
  ];

  return (
    <section id="testimonials" className="py-section px-gutter bg-background scroll-mt-20">
      <div className="w-full max-w-content mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.testimonialsBadge}</span>
          <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-3">{t.testimonialsTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.testimonialsDesc}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(({ text, author }, i) => (
            <div key={i} className="bg-background rounded-2xl border border-border p-6 shadow-xs">
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

        <div className="text-center mt-8">
          <a
            href="https://preply.com/en/tutor/471612"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            {t.testimonialsAllReviews}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
