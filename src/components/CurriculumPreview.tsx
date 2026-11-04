import { useI18n } from "@/lib/i18n";
import { getCurriculum, getCurriculumPreview } from "@/data/curriculum";
import { Link } from "@/components/LocalizedLink";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** A1 → C2 at a glance, built only from src/data/curriculum.ts. */
const CurriculumPreview = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  const levels = getCurriculum(en ? "en" : "ro");

  return (
    <section id="curriculum" className="py-section px-gutter bg-background scroll-mt-20">
      <div className="w-full max-w-3xl mx-auto">
        <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
          Curriculum A1 → C2
        </span>
        <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-8">
          {en ? "What you learn at each level" : "Ce înveți la fiecare nivel"}
        </h2>
        <Accordion type="single" collapsible className="rounded-2xl border border-[#E7E1D6] bg-card px-5 dark:border-border">
          {levels.map((lvl) => {
            const { obj, mods } = getCurriculumPreview(en ? "en" : "ro", lvl.id, 4);
            return (
              <AccordionItem key={lvl.id} value={lvl.id}>
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {lvl.title}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{obj}</p>
                  {mods.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80 mb-3">
                      {mods.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  )}
                  <Link
                    to={`/cursuri/grup/${lvl.id}`}
                    className="text-sm font-semibold text-primary hover:underline underline-offset-4"
                  >
                    {en ? "Full curriculum →" : "Curriculumul complet →"}
                  </Link>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        <Link
          to="/cursuri"
          className="mt-6 inline-block text-sm font-semibold text-primary hover:underline underline-offset-4"
        >
          {en ? "See all courses →" : "Vezi toate cursurile →"}
        </Link>
      </div>
    </section>
  );
};

export default CurriculumPreview;
