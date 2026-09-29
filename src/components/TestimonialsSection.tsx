import { useI18n } from "@/lib/i18n";

/**
 * Reviews, as in the design: one featured quote and two smaller ones, all real
 * Preply reviews, plus the link to the full list. The owner chose these three;
 * the other translated quotes stay in i18n but are no longer shown here.
 */
const TestimonialsSection = () => {
  const { t } = useI18n();

  const small = [
    { text: t.testimonial5, author: t.testimonial5Author },
    { text: t.testimonial3, author: t.testimonial3Author },
  ];

  return (
    <section id="testimonials" className="py-section px-gutter bg-background scroll-mt-20">
      <div className="w-full max-w-content mx-auto">
        <div className="mb-8">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">{t.testimonialsBadge}</span>
          <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground">{t.testimonialsTitle}</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <figure className="m-0 flex flex-col justify-center gap-6 rounded-3xl border border-[#E7E1D6] bg-card p-7 sm:p-12 lg:col-span-7 dark:border-border">
            <span className="text-[22px] tracking-[4px] text-[#B8892E]" aria-label="5/5">★★★★★</span>
            <blockquote className="m-0 font-display text-2xl font-semibold leading-snug text-foreground sm:text-[1.875rem] sm:leading-[1.4]">
              „{t.testimonial1}”
            </blockquote>
            <figcaption className="text-base font-semibold text-foreground">
              {t.testimonial1Author} <span className="font-normal text-muted-foreground">· Preply</span>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-6 lg:col-span-5">
            {small.map(({ text, author }) => (
              <figure
                key={author}
                className="m-0 flex flex-col gap-3.5 rounded-3xl border border-[#E7E1D6] bg-card p-7 dark:border-border"
              >
                <blockquote className="m-0 text-[17px] leading-relaxed text-foreground">„{text}”</blockquote>
                <figcaption className="text-[15px] font-semibold text-foreground">
                  {author} <span className="font-normal text-muted-foreground">· Preply</span>
                </figcaption>
              </figure>
            ))}
            <a
              href="https://preply.com/en/tutor/471612"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-semibold text-brand-green underline underline-offset-4 hover:opacity-80"
            >
              {t.testimonialsAllReviews} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
