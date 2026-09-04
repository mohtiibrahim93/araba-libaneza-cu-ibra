import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { allFaqs, faqJsonLd, featuredFaqs } from "@/data/faq";

/**
 * The homepage FAQ: six questions, two rows of three, and a link to the rest.
 *
 * This used to render all thirty-nine questions in one stacked accordion — the
 * single longest thing on the page, pushing everything below it out of reach.
 * The full list now lives at /intrebari-frecvente (EN: /en/faq); the content
 * itself is in src/data/faq.ts so the two pages cannot drift apart.
 *
 * The JSON-LD here covers only the six rendered questions. Marking up answers a
 * visitor cannot see on the page is exactly what Google's structured-data
 * guidelines forbid, so the full page emits the complete FAQPage and this one
 * emits its six.
 */
const FAQSection = () => {
  const { t, lang } = useI18n();
  const featured = featuredFaqs(lang);
  const total = allFaqs(lang).length;
  const allHref = lang === "en" ? "/en/faq" : "/intrebari-frecvente";

  return (
    <section id="faq" className="py-section px-6 scroll-mt-20">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd(featured))}</script>
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.faqBadge}</span>
          <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-3">
            {t.faqTitle}
          </h2>
          <p className="text-muted-foreground">{t.faqDesc}</p>
        </div>

        {/* Two rows of three on desktop, one column on a phone. Each card is an
            independent accordion so opening one does not collapse its row. */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((faq, i) => (
            <Accordion key={i} type="single" collapsible className="h-full">
              <AccordionItem
                value={`faq-${i}`}
                className="h-full bg-background border border-border rounded-xl px-5 border-b"
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to={allHref}
            data-cta
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            {t.faqSeeAll.replace("{n}", String(total))}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">{t.faqSeeAllHint}</p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
