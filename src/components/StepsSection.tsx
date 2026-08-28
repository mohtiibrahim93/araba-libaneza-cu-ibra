import { useI18n } from "@/lib/i18n";
import { ClipboardList, CreditCard, MessageCircle, ArrowRight } from "lucide-react";
import AnchorLink from "@/components/AnchorLink";

/**
 * "3 pași simpli" (Ref A): choose → register → speak. Static content that
 * funnels straight into the real enrollment flow (#programs).
 */
const StepsSection = () => {
  const { t } = useI18n();

  const steps = [
    { Icon: ClipboardList, title: t.step1Title, desc: t.step1Desc },
    { Icon: CreditCard, title: t.step2Title, desc: t.step2Desc },
    { Icon: MessageCircle, title: t.step3Title, desc: t.step3Desc },
  ];

  return (
    <section className="py-section px-gutter">
      <div className="w-full max-w-content mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-3">
            {t.stepsTitle}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.stepsDesc}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className="relative bg-cream rounded-2xl border border-border/60 p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {i + 1}
                </span>
                <Icon className="w-5 h-5 text-brand-green" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <AnchorLink
            to="#programs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            {t.stepsCta}
            <ArrowRight className="w-4 h-4" />
          </AnchorLink>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
