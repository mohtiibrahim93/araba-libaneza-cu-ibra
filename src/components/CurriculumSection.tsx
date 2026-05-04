import { useI18n } from "@/lib/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";
import AnchorLink from "@/components/AnchorLink";

const CurriculumSection = () => {
  const { t } = useI18n();

  const levels = [
    { id: "a1", title: t.curriculumA1Title, obj: t.curriculumA1Obj, mods: [t.curriculumA1M1, t.curriculumA1M2, t.curriculumA1M3] },
    { id: "a2", title: t.curriculumA2Title, obj: t.curriculumA2Obj, mods: [t.curriculumA2M1, t.curriculumA2M2, t.curriculumA2M3] },
    { id: "b1", title: t.curriculumB1Title, obj: t.curriculumB1Obj, mods: [t.curriculumB1M1, t.curriculumB1M2, t.curriculumB1M3] },
    { id: "b2", title: t.curriculumB2Title, obj: t.curriculumB2Obj, mods: [t.curriculumB2M1, t.curriculumB2M2, t.curriculumB2M3] },
    { id: "c1", title: t.curriculumC1Title, obj: t.curriculumC1Obj, mods: [t.curriculumC1M1, t.curriculumC1M2, t.curriculumC1M3] },
    { id: "c2", title: t.curriculumC2Title, obj: t.curriculumC2Obj, mods: [t.curriculumC2M1, t.curriculumC2M2, t.curriculumC2M3] },
  ];

  return (
    <section id="curriculum" className="py-20 px-6 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-primary mb-2 block">{t.curriculumBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            {t.curriculumTitle}
          </h2>
          <p className="text-muted-foreground">{t.curriculumDesc}</p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {levels.map((lvl) => (
            <AccordionItem
              key={lvl.id}
              value={lvl.id}
              className="rounded-xl border border-border bg-background px-5 data-[state=open]:border-primary/40"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {lvl.title}
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <p className="text-sm text-foreground mb-3">
                  <span className="font-semibold">{t.curriculumObjective}</span>{" "}
                  <span className="text-muted-foreground">{lvl.obj}</span>
                </p>
                <ul className="space-y-2.5">
                  {lvl.mods.map((m, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </span>
                      <span className="text-muted-foreground">{m}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-10">
          <AnchorLink
            to="#inscriere"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90"
          >
            {t.curriculumCta} →
          </AnchorLink>
        </div>
      </div>
    </section>
  );
};

export default CurriculumSection;