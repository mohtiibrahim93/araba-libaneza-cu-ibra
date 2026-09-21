import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router-compat";
import NativeScheduler from "@/components/NativeScheduler";
import { useI18n } from "@/lib/i18n";
import { canonicalPath } from "@/lib/languageRoutes";
import { seoMeta } from "@/lib/seoHead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TrialPage = () => {
  const { t, lang } = useI18n();
  // The registration this visit created, if any. Held in a ref so a retry
  // after a clashing slot reuses the row instead of writing a second one.
  const registrationIdRef = useRef<string | null>(null);

  /**
   * Creates the lead row at the moment of booking, from the details the
   * scheduler has just collected.
   *
   * This page used to ask for name, email and phone on a screen of its own
   * before it would show any times — a visitor handed over their details
   * before knowing whether a single slot suited them, and then typed them
   * again in the scheduler's confirm form. The times come first now.
   *
   * Worth naming: the old order captured an email from people who never
   * reached a slot, and this one does not. That is the cost of the change —
   * the gain is that nobody is asked for anything until they have seen a time
   * they want.
   */
  const ensureRegistration = async (d: { name: string; email: string; phone: string }) => {
    if (registrationIdRef.current) return registrationIdRef.current;
    const id = crypto.randomUUID();
    const { error } = await supabase.from("registrations").insert({
      id,
      form_type: "trial",
      name: d.name,
      email: d.email,
      phone: d.phone,
      // The language the visitor is actually reading the site in. Without it a
      // trial lead arrived with language NULL, so there was no way to tell an
      // English enquiry from a Romanian one — which is also what decides which
      // cohorts they can be offered.
      language: lang,
      // Still "incomplete" at this point: booking-create promotes it to "new"
      // the moment the slot is actually taken, and that is what fires
      // trial_booking_complete. If the slot clashes and the booking fails, the
      // row correctly stays incomplete rather than counting as a conversion.
      lead_status: "incomplete",
    });
    if (error) {
      console.error("[trial] registration insert failed", error);
      toast.error(t.schedulerBookingFailed);
      return null;
    }
    registrationIdRef.current = id;
    return id;
  };

  // From the route table in src/lib/seoHead.ts — the same one the route's
  // head() serves, and the one meta-length.test.ts holds inside the truncation
  // limits. Written here as well, the two heads drifted.
  const meta = seoMeta(canonicalPath("/trial", lang));
  const title = meta?.title ?? t.trialPageSeoTitle;
  const description = meta?.description ?? t.trialPageSeoDesc;

  return (
    <main id="main-content" className="min-h-screen bg-background py-12 px-gutter">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://centruldearabalibaneza.com${canonicalPath("/trial", lang)}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Helmet>
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