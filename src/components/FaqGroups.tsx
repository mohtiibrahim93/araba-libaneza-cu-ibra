import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_CONTENT } from "@/data/faq";

/**
 * The full question list, grouped by topic — the body of /intrebari-frecvente
 * and /en/faq.
 *
 * Rendered from src/data/faq.ts, the same array the six on the homepage come
 * from, so an answer edited once is right in both places. The FAQPage markup is
 * emitted by whichever layout wraps this, over the same items.
 */
const FaqGroups = ({ lang }: { lang: "ro" | "en" }) => {
  const { groups } = FAQ_CONTENT[lang];

  return (
    <div className="not-prose space-y-10">
      {groups.map((group, gi) => (
        <section key={gi} id={`faq-group-${gi}`} className="scroll-mt-28">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
              {gi + 1}
            </span>
            {group.title}
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {group.items.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${gi}-${i}`}
                className="bg-card border border-[#E7E1D6] rounded-2xl px-5 data-[state=open]:border-brand-green/40 data-[state=open]:bg-brand-green/[0.03] dark:border-border"
              >
                <AccordionTrigger className="text-[15px] font-semibold text-foreground hover:no-underline py-4 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-foreground/80 pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  );
};

export default FaqGroups;
