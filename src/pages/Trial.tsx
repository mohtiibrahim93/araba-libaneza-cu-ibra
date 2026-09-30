import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router-compat";
import NativeScheduler from "@/components/NativeScheduler";
import { useI18n } from "@/lib/i18n";
import { useTrialRegistration } from "@/hooks/useTrialRegistration";

const TrialPage = () => {
  const { t } = useI18n();
  const ensureRegistration = useTrialRegistration();

  // No <head> written here: the route serves the title, description and
  // canonical from src/lib/seoHead.ts. A second copy in the component is how
  // every page ended up with two titles and two descriptions.

  return (
    <main id="main-content" className="min-h-screen bg-background py-12 px-gutter">
      <div className="w-full max-w-2xl 2xl:max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {t.navHome}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t.trialPageTitle}</h1>
        <p className="text-muted-foreground mb-4">{t.trialPageSubtitle}</p>

        {/* One screen, and the times come first. The step indicator that used
            to live here described two screens; there is only one now, and the
            scheduler shows its own "back to the times" control once a slot is
            chosen. */}
        <div className="bg-background rounded-2xl border border-border p-6 shadow-xs">
          {/* booking-create promotes the lead from "incomplete" to a real one
              server-side once the slot is taken; RLS blocks browser updates,
              and the scheduler shows its own confirmation. */}
          <NativeScheduler eventType="trial" ensureRegistration={ensureRegistration} />
        </div>

        {/* Below the form on purpose: the booking flow stays the first thing a
            visitor sees, and this explains the offer to anyone still deciding —
            and to crawlers, for which 67 words of visible text was too thin to
            be worth indexing. */}
        <section className="mx-auto mt-section max-w-2xl space-y-8 text-left">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.trialWhatH2}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.trialWhatP}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.trialWhyH2}</h2>
            <p className="text-muted-foreground leading-relaxed">{t.trialWhyP}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.trialHowH2}</h2>
            <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>{t.trialHowLi1}</li>
              <li>{t.trialHowLi2}</li>
              <li>{t.trialHowLi3}</li>
              <li>{t.trialHowLi4}</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{t.trialRulesH2}</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>{t.trialRulesLi1}</li>
              <li>{t.trialRulesLi2}</li>
              <li>{t.trialRulesLi3}</li>
              <li>{t.trialRulesLi4}</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default TrialPage;