import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";
import AnchorLink from "@/components/AnchorLink";
import { getCurriculum, type CurriculumLevel } from "@/data/curriculum";

const CurriculumSection = () => {
  const { t, lang } = useI18n();
  const [openLevel, setOpenLevel] = useState<string>("");

  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      const match = hash.match(/^curriculum-(a1|a2|b1|b2|c1|c2)$/);
      if (match) {
        setOpenLevel(match[1]);
        setTimeout(() => {
          const el = document.getElementById(`curriculum-${match[1]}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const levels = getCurriculum(lang);

  const ItemList = ({ items }: { items: string[] }) => (
    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
      {items.map((m, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          </span>
          <span className="text-muted-foreground">{m}</span>
        </li>
      ))}
    </ul>
  );

  const StatsRow = ({ lvl }: { lvl: CurriculumLevel }) => (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
        {lvl.lessons} {t.curriculumLessonsLabel}
      </span>
      <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
        {lvl.hours} {t.curriculumHoursLabel}
      </span>
      <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-foreground">
        {t.curriculumTrackLabel} {lvl.trackLabel}
      </span>
    </div>
  );

  return (
    <section id="curriculum" className="py-20 px-6 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-primary mb-2 block">{t.curriculumBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            {t.curriculumTitle}
          </h2>
          <p className="text-muted-foreground">{t.curriculumDesc}</p>
        </div>

        <Accordion
          type="single"
          collapsible
          value={openLevel}
          onValueChange={setOpenLevel}
          className="space-y-3"
        >
          {levels.map((lvl) => (
            <AccordionItem
              key={lvl.id}
              value={lvl.id}
              id={`curriculum-${lvl.id}`}
              className="rounded-xl border border-border bg-background px-5 data-[state=open]:border-primary/40 scroll-mt-24"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                {lvl.title}
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <StatsRow lvl={lvl} />
                <p className="text-sm text-foreground mb-3">
                  <span className="font-semibold">{t.curriculumObjective}</span>{" "}
                  <span className="text-muted-foreground">{lvl.objective}</span>
                </p>
                {lvl.items && <ItemList items={lvl.items} />}
                {lvl.spokenCore && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2.5">
                        {lvl.spokenCore.intro}
                      </h4>
                      <ItemList items={lvl.spokenCore.items} />
                    </div>
                    {lvl.writingStrand && (
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-2.5">
                          {lvl.writingStrand.intro}
                        </h4>
                        <ItemList items={lvl.writingStrand.items} />
                      </div>
                    )}
                  </div>
                )}
                {lvl.blocks && (
                  <div className="space-y-5">
                    {lvl.blocks.map((b, i) => (
                      <div key={i}>
                        <h4 className="text-sm font-semibold text-foreground mb-2.5">
                          {b.title}
                        </h4>
                        <ItemList items={b.items} />
                      </div>
                    ))}
                    {lvl.note && (
                      <p className="text-xs text-muted-foreground italic pt-3 border-t border-border">
                        {lvl.note}
                      </p>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-10">
          <AnchorLink
            to="#programs"
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