import { CalendarDays, Clock, ExternalLink, MapPin, Star, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NativeScheduler from "@/components/NativeScheduler";
import { useI18n } from "@/lib/i18n";
import { useTrialRegistration } from "@/hooks/useTrialRegistration";
import instructorPhotoJpg from "@/assets/instructor-photo.jpg";
import instructorPhotoWebp from "@/assets/instructor-photo.webp";

const TrialPage = () => {
  const { t, lang } = useI18n();
  const en = lang === "en";
  const ensureRegistration = useTrialRegistration();

  // No <head> written here: the route serves the title, description and
  // canonical from src/lib/seoHead.ts. A second copy in the component is how
  // every page ended up with two titles and two descriptions.

  const facts = [
    { Icon: Clock, text: "30 min" },
    { Icon: Wallet, text: "0 lei" },
    { Icon: CalendarDays, text: en ? "Online any day" : "Online în orice zi" },
    { Icon: MapPin, text: en ? "In person at weekends" : "Fizic în weekend" },
  ];
  const steps = [t.trialHowLi1, t.trialHowLi2, t.trialHowLi3, t.trialHowLi4];
  // The card rule is stated once, in the notice beside the calendar where the
  // decision is made. It used to appear three times: under the title, in that
  // notice and as the last "good to know" point (trialRulesLi4).
  const rules = [t.trialRulesLi1, t.trialRulesLi2, t.trialRulesLi3];
  const card = "rounded-3xl border border-[#E7E1D6] bg-card dark:border-border";

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-background px-gutter pb-section pt-28">
        <div className="mx-auto w-full max-w-content">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
            {en ? "Free lesson" : "Lecție gratuită"}
          </span>
          <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground">
            {t.trialPageTitle}
          </h1>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {facts.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-[15px] font-medium text-foreground/85">
                <Icon className="h-4 w-4 text-brand-green" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>

          {/* The calendar first and widest; who you are booking with beside it.
              On phones the calendar comes first. */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className={`${card} p-4 sm:p-6`}>
              {/* booking-create promotes the lead from "incomplete" to a real one
                  server-side once the slot is taken; RLS blocks browser updates,
                  and the scheduler shows its own confirmation. */}
              <NativeScheduler eventType="trial" ensureRegistration={ensureRegistration} />
            </div>

            <aside className={`${card} flex items-center gap-4 self-start p-4 lg:flex-col lg:items-stretch lg:p-6`}>
              <picture className="w-20 shrink-0 lg:w-full">
                <source srcSet={instructorPhotoWebp} type="image/webp" />
                <img
                  src={instructorPhotoJpg}
                  alt={en ? "Ibra, native Lebanese Arabic teacher" : "Ibra, profesor nativ de arabă libaneză"}
                  width={320}
                  height={320}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-xl object-cover lg:rounded-2xl"
                />
              </picture>
              <div className="flex flex-col gap-2 lg:gap-4">
              <div>
                <p className="font-display text-xl font-bold text-foreground">
                  {en ? "With Ibra" : "Cu Ibra"}
                </p>
                <p className="text-[15px] text-foreground/75">
                  {en ? "Native teacher from Lebanon" : "Profesor nativ din Liban"}
                </p>
              </div>
              <a
                href="https://preply.com/en/tutor/471612"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <Star className="h-3.5 w-3.5 fill-primary" aria-hidden="true" />
                {t.instructorPreplyBadge}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              </div>
            </aside>
          </div>

          {/* Below the calendar on purpose: booking stays the first thing a
              visitor sees, and this explains the offer to anyone still deciding
              — and to crawlers, for which 67 words of visible text was too thin
              to be worth indexing. */}
          <section className="mt-section">
            <h2 className="mb-5 font-display text-display-md font-bold text-foreground">{t.trialHowH2}</h2>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <li key={i} className={`${card} flex flex-col gap-3 p-5`}>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-[15px] leading-relaxed text-foreground/85">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-section grid gap-5 md:grid-cols-2">
            <div className={`${card} p-6 sm:p-7`}>
              <h2 className="mb-3 font-display text-xl font-bold text-foreground">{t.trialWhatH2}</h2>
              <p className="leading-relaxed text-foreground/80">{t.trialWhatP}</p>
            </div>
            <div className={`${card} p-6 sm:p-7`}>
              <h2 className="mb-3 font-display text-xl font-bold text-foreground">{t.trialWhyH2}</h2>
              <p className="leading-relaxed text-foreground/80">{t.trialWhyP}</p>
            </div>
          </section>

          <section className="mt-5 rounded-3xl bg-cream p-6 sm:p-8">
            <h2 className="mb-3 font-display text-xl font-bold text-foreground">{t.trialRulesH2}</h2>
            <ul className="list-disc space-y-2 pl-5 text-foreground/80">
              {rules.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TrialPage;
