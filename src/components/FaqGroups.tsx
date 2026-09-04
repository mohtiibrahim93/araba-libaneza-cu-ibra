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
        <section key={gi} id={`faq-group-${gi}`} className="scroll-mt-24">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            {group.title}
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {group.items.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${gi}-${i}`}
                className="bg-background border border-border rounded-xl px-5"
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
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
