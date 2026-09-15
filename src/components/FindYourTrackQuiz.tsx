import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "@/components/LocalizedLink";
import { useSearchParams } from "@/lib/router-compat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, Baby, GraduationCap, ChevronRight } from "lucide-react";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import ComparisonPanel from "@/components/ComparisonPanel";
import SpotsBadge from "@/components/SpotsBadge";

type Audience = "self" | "kids";
type Format = "group" | "private";
type Level = "A1" | "A2" | "B1" | "B2";
type Track = "group" | "private" | "kids";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2"];

/**
 * Where the visitor had got to before being handed to the placement test.
 *
 * The test lives in the game, on another page, so coming back is a fresh page
 * load and the answers they already gave are gone. Without this they would
 * return holding a tested level and be asked question one again — which is the
 * whole reason they left. sessionStorage rather than localStorage: this is one
 * journey, not a preference to remember next month.
 */
const CONTEXT_KEY = "quiz-context";

const GROUP_PRICE_BY_LEVEL: Record<Level, number> = {
  A1: 500,
  A2: 600,
  B1: 700,
  B2: 800,
};

interface OptionCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const OptionCard = ({ title, desc, icon, onClick }: OptionCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group text-left w-full rounded-xl border border-border bg-background p-5 hover:border-primary hover:bg-primary/5 transition-all hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
  >
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
    </div>
  </button>
);

const FindYourTrackQuiz = () => {
  const { t } = useI18n();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [format, setFormat] = useState<Format | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [searchParams] = useSearchParams();

  // Remember the answers before handing off, so the test's result can drop them
  // back on their recommendation rather than at the start.
  const rememberContext = () => {
    try {
      sessionStorage.setItem(CONTEXT_KEY, JSON.stringify({ audience, format }));
    } catch {
      // Private mode or blocked storage: they answer the two questions again.
    }
  };

  // Coming back from the placement test with a tested level. Done in an effect
  // rather than in the initial state so the server and the first client render
  // agree — this page is server-rendered, and a hydration mismatch here is the
  // class of bug the migration already had to fix once.
  useEffect(() => {
    const tested = searchParams.get("level");
    if (!tested || !LEVELS.includes(tested as Level)) return;
    let saved: { audience?: Audience; format?: Format } = {};
    try {
      saved = JSON.parse(sessionStorage.getItem(CONTEXT_KEY) ?? "{}");
    } catch {
      // Nothing stored — fall through to the defaults below.
    }
    // The level step is only reachable on the self + group branch, so that is
    // what someone arriving straight from the game was being measured for.
    setAudience(saved.audience ?? "self");
    setFormat(saved.format ?? "group");
    setLevel(tested as Level);
    setStep(4);
  }, [searchParams]);

  // Compute total/current steps for the dots
  const isKidsPath = audience === "kids";
  const totalSteps = isKidsPath ? 1 : format === "group" ? 3 : audience === "self" && format === "private" ? 2 : audience === "self" ? 2 : 3;
  const currentStep = step;

  const reset = () => {
    setStep(1);
    setAudience(null);
    setFormat(null);
    setLevel(null);
    setShowForm(false);
    setShowComparison(false);
  };

  const back = () => {
    if (showComparison) {
      setShowComparison(false);
      return;
    }
    if (step === 4) {
      // back from result
      if (isKidsPath) setStep(1);
      else if (format === "group") setStep(3);
      else setStep(2);
      return;
    }
    if (step === 3) setStep(2);
    else if (step === 2) {
      setAudience(null);
      setStep(1);
    }
  };

  const track: Track | null =
    audience === "kids"
      ? "kids"
      : format === "private"
        ? "private"
        : format === "group" && level
          ? "group"
          : null;

  // ----- Comparison panel -----
  if (showComparison) {
    return <ComparisonPanel onBack={() => setShowComparison(false)} />;
  }

  // ----- Inline registration form (after CTA) -----
  if (showForm && track) {
    return (
      <section id="quiz" className="py-section px-6 bg-muted/50 scroll-mt-20">
        <div className="max-w-2xl mx-auto bg-background rounded-2xl border border-border p-6 shadow-xs">
          <RegistrationFormSection
            defaultCourseType={track}
            embedded
            onBack={() => setShowForm(false)}
          />
        </div>
      </section>
    );
  }

  // ----- Step content -----
  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground text-center">{t.quizQ1}</h3>
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <OptionCard
              title={t.quizQ1OptSelf}
              desc={t.quizQ1OptSelfDesc}
              icon={<User className="w-5 h-5" />}
              onClick={() => {
                setAudience("self");
                setStep(2);
              }}
            />
            <OptionCard
              title={t.quizQ1OptKids}
              desc={t.quizQ1OptKidsDesc}
              icon={<Baby className="w-5 h-5" />}
              onClick={() => {
                setAudience("kids");
                setStep(4);
              }}
            />
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground text-center">{t.quizQ2}</h3>
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <OptionCard
              title={t.quizQ2OptGroup}
              desc={t.quizQ2OptGroupDesc}
              icon={<Users className="w-5 h-5" />}
              onClick={() => {
                setFormat("group");
                setStep(3);
              }}
            />
            <OptionCard
              title={t.quizQ2OptPrivate}
              desc={t.quizQ2OptPrivateDesc}
              icon={<User className="w-5 h-5" />}
              onClick={() => {
                setFormat("private");
                setStep(4);
              }}
            />
          </div>
        </div>
      );
    }
    if (step === 3) {
      const levels: { value: Level; label: string }[] = [
        { value: "A1", label: t.quizQ3OptA1 },
        { value: "A2", label: t.quizQ3OptA2 },
        { value: "B1", label: t.quizQ3OptB1 },
        { value: "B2", label: t.quizQ3OptB2 },
      ];
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground text-center">{t.quizQ3}</h3>
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {levels.map((l) => (
              <div key={l.value} className="relative">
                <OptionCard
                  title={l.label}
                  desc={l.value}
                  icon={<GraduationCap className="w-5 h-5" />}
                  onClick={() => {
                    setLevel(l.value);
                    setStep(4);
                  }}
                />
                <div className="absolute top-2 right-2 pointer-events-none">
                  <SpotsBadge formType="group" level={l.value} compact />
                </div>
              </div>
            ))}
          </div>
          {/* This step asks people to declare a level, which is the one thing a
              beginner cannot do — and "Test de nivel gratuit" is what the page
              title promises them. The game already runs a real 24-question
              placement test, so send them there instead of making them guess.
              Its result screen links back to the trial lesson, closing the loop. */}
          <p className="pt-1 text-center text-sm text-muted-foreground">
            {t.quizQ3NotSure}{" "}
            <Link
              to="/joc?view=placement"
              onClick={rememberContext}
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {t.quizQ3Placement}
              <ChevronRight className="inline w-3.5 h-3.5 -mt-0.5" aria-hidden />
            </Link>
          </p>
        </div>
      );
    }
    // step 4: result
    if (!track) return null;
    const title =
      track === "kids"
        ? t.quizResultKidsTitle
        : track === "private"
          ? t.quizResultPrivateTitle
          : t.quizResultGroupTitle.replace("{level}", level ?? "A1");
    const desc =
      track === "kids"
        ? t.quizResultKidsDesc
        : track === "private"
          ? t.quizResultPrivateDesc
          : t.quizResultGroupDesc;
    const price =
      track === "kids"
        ? t.quizResultPriceKids
        : track === "private"
          ? t.quizResultPricePrivate
          : t.quizResultPriceFromGroup.replace(
              "{price}",
              String(GROUP_PRICE_BY_LEVEL[level ?? "A1"]),
            );
    const Icon = track === "kids" ? Baby : track === "private" ? User : Users;

    return (
      <div className="animate-in fade-in zoom-in-95 duration-300">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
              {t.quizResultTitle}
            </p>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">{desc}</p>
            <p className="text-lg font-semibold text-foreground mb-6">{price}</p>
            {(track === "group" || track === "kids") && (
              <div className="flex justify-center mb-6 -mt-2">
                <SpotsBadge
                  formType={track === "kids" ? "kids" : "group"}
                  level={track === "group" ? (level ?? "A1") : null}
                />
              </div>
            )}
            <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowForm(true)}>
              {t.quizContinueCta}
            </Button>
            <div className="mt-4 flex flex-col items-center gap-2">
              <a
                href="/trial"
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                {t.trialQuizCta}
              </a>
              <button
                type="button"
                onClick={() => setShowComparison(true)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t.quizCompareAll}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <section id="quiz" className="py-section px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-primary mb-2 block">{t.quizBadge}</span>
          <h1 className="text-display-lg font-bold tracking-tight text-foreground mb-3">
            {t.quizTitle}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.quizDesc}</p>
        </div>

        <Card className="shadow-xs">
          <CardContent className="p-6 sm:p-8">
            {/* Progress dots + step label */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2" aria-label={t.quizStepLabel.replace("{n}", String(currentStep)).replace("{total}", String(totalSteps))}>
                {Array.from({ length: totalSteps }).map((_, i) => {
                  const active = i + 1 <= currentStep;
                  return (
                    <span
                      key={i}
                      className={`h-2 rounded-full transition-all ${
                        active ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                      }`}
                    />
                  );
                })}
              </div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={step === 4 ? reset : back}
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {step === 4 ? t.quizRestart : t.quizBack}
                </button>
              )}
            </div>

            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FindYourTrackQuiz;