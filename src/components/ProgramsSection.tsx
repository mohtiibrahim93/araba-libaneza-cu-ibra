import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Check, MessageCircle, CheckCircle2 } from "lucide-react";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useGroupCapacities } from "@/hooks/useGroupCapacity";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import groupImg from "@/assets/group-course.jpg";
import privateImg from "@/assets/private-course.jpg";
import kidsImg from "@/assets/kids-course.jpg";

const wa = (msg: string) =>
  "https://wa.me/40763124514?text=" + encodeURIComponent(msg);
const WA_GROUP = wa("Salut! Vreau să mă înscriu la cursul de grup de arabă libaneză.");
const WA_PRIVATE = wa("Salut! Sunt interesat(ă) de lecții private de arabă libaneză.");
const WA_KIDS = wa("Salut! Sunt interesat(ă) de cursul de arabă libaneză pentru copii.");

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];

const LEVEL_MONTHLY: Record<Level, number> = {
  A1: 500, A2: 600, B1: 700, B2: 800, C1: 900, C2: 1000,
};

type InlineForm = null | "group" | "private" | "kids" | "kidsPrivate";

const formatLei = (n: number) =>
  n % 1 === 0 ? n.toLocaleString("ro-RO") : n.toFixed(1).replace(".", ",");

const ProgramsSection = () => {
  const { t } = useI18n();
  const [inlineForm, setInlineForm] = useState<InlineForm>(null);
  const { get: getCapacity } = useGroupCapacities();
  const groupCap = getCapacity("group", "A1");
  const kidsCap = getCapacity("kids", null);

  const levelCurriculum: Record<Level, { obj: string; mods: string[]; sub: string }> = {
    A1: { sub: t.levelA1Subtitle, obj: t.curriculumA1Obj, mods: [t.curriculumA1M1, t.curriculumA1M2, t.curriculumA1M3] },
    A2: { sub: t.levelA2Subtitle, obj: t.curriculumA2Obj, mods: [t.curriculumA2M1, t.curriculumA2M2, t.curriculumA2M3] },
    B1: { sub: t.levelB1Subtitle, obj: t.curriculumB1Obj, mods: [t.curriculumB1M1, t.curriculumB1M2, t.curriculumB1M3] },
    B2: { sub: t.levelB2Subtitle, obj: t.curriculumB2Obj, mods: [t.curriculumB2M1, t.curriculumB2M2, t.curriculumB2M3] },
    C1: { sub: t.levelC1Subtitle, obj: t.curriculumC1Obj, mods: [t.curriculumC1M1, t.curriculumC1M2, t.curriculumC1M3] },
    C2: { sub: t.levelC2Subtitle, obj: t.curriculumC2Obj, mods: [t.curriculumC2M1, t.curriculumC2M2, t.curriculumC2M3] },
  };

  const showForm = (key: Exclude<InlineForm, null>) => inlineForm === key;
  const renderForm = (formType: "group" | "private" | "kids") => (
    <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm p-6">
      <RegistrationFormSection
        defaultCourseType={formType}
        embedded
        onBack={() => setInlineForm(null)}
      />
    </div>
  );

  // Reusable card scaffolding
  const CardShell = ({
    img, alt, badge, title, subtitle, children,
  }: {
    img: string; alt: string; badge: string; title: string; subtitle: string; children: React.ReactNode;
  }) => (
    <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <img src={img} alt={alt} className="w-full h-52 object-cover" />
      <div className="p-6 flex flex-col flex-1">
        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 self-start">
          {badge}
        </span>
        <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{subtitle}</p>
        {children}
      </div>
    </div>
  );

  const MetaList = ({ items }: { items: { label: string; value: string }[] }) => (
    <dl className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 mb-5">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</dt>
          <dd className="text-sm font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );

  const FeatList = ({ items }: { items: string[] }) => (
    <ul className="space-y-2 mb-6">
      {items.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );

  const CtaBlock = ({
    onClick, label, waHref,
  }: { onClick: () => void; label: string; waHref: string }) => (
    <div className="mt-auto">
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-center py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        {label}
      </button>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center justify-center gap-1.5 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        WhatsApp
      </a>
    </div>
  );

  // === ADULT GROUP CARD ===
  const AdultGroupCard = () => {
    const capLine = groupCap ? (
      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs rounded-lg border border-border bg-muted/40 px-3 py-2">
        <span className="font-semibold text-foreground">
          {groupCap.taken}/{groupCap.max} {t.capSeatsLabel}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className={groupCap.belowMin ? "text-amber-600 dark:text-amber-500 font-medium" : "text-muted-foreground"}>
          {groupCap.full
            ? t.capFull
            : groupCap.belowMin
              ? t.capNeedToStart.replace("{n}", String(groupCap.needToStart))
              : t.capSpotsLeft.replace("{n}", String(groupCap.seatsLeft))}
        </span>
      </div>
    ) : null;

    return (
      <CardShell
        img={groupImg}
        alt={t.groupCardTitle}
        badge={t.groupBadge}
        title={t.groupCardTitle}
        subtitle={t.groupCardSubtitle}
      >
        {capLine}
        <MetaList items={[
          { label: t.programFormatLabel, value: t.groupFormatOnlineOrPhysical },
          { label: t.programDurationLabel, value: t.groupDurationLesson },
          { label: t.pricingGroup3MonthsLabel, value: t.programGroupDuration },
          { label: t.programConditionsLabel, value: t.groupConditions },
        ]} />
        <FeatList items={[t.groupFeat1, t.groupFeat2, t.groupFeat3, t.groupFeat4]} />

        {/* Price table */}
        <div className="mb-3 -mx-2 overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground">
                <th className="text-left font-semibold py-2 px-2">{t.priceTableLevel}</th>
                <th className="text-right font-semibold py-2 px-2">{t.priceTableMonth}</th>
                <th className="text-right font-semibold py-2 px-2">{t.priceTableTotal}</th>
                <th className="text-right font-semibold py-2 px-2">{t.priceTableDiscount}</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((lvl) => {
                const m = LEVEL_MONTHLY[lvl];
                const total = m * 3;
                const disc = total * 0.9;
                return (
                  <tr key={lvl} className="border-t border-border">
                    <td className="py-2 px-2 font-semibold text-foreground">{lvl}</td>
                    <td className="py-2 px-2 text-right text-foreground">{formatLei(m)} LEI</td>
                    <td className="py-2 px-2 text-right text-muted-foreground line-through">{formatLei(total)} LEI</td>
                    <td className="py-2 px-2 text-right font-bold text-primary">{formatLei(disc)} LEI</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs font-medium text-primary mb-4">{t.pricingGroupDiscount}</p>

        {/* Curriculum accordion */}
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t.curriculumByLevelHint}</p>
        <Accordion type="single" collapsible className="mb-6 rounded-lg border border-border bg-muted/30">
          {LEVELS.map((lvl) => {
            const c = levelCurriculum[lvl];
            return (
              <AccordionItem key={lvl} value={lvl} className="border-border last:border-0 px-4">
                <AccordionTrigger className="text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-primary">{lvl}</span>
                    <span className="text-muted-foreground font-normal">— {c.sub}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">{t.curriculumObjective}</p>
                  <p className="text-sm text-foreground mb-3">{c.obj}</p>
                  <ul className="space-y-2">
                    {c.mods.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{m}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <CtaBlock onClick={() => setInlineForm("group")} label={t.groupRegister} waHref={WA_GROUP} />
      </CardShell>
    );
  };

  // === ADULT PRIVATE CARD ===
  const AdultPrivateCard = () => (
    <CardShell
      img={privateImg}
      alt={t.privateCardTitle}
      badge={t.privateBadge}
      title={t.privateCardTitle}
      subtitle={t.privateCardSubtitle}
    >
      <MetaList items={[
        { label: t.programFormatLabel, value: t.privateFormat },
        { label: t.programDurationLabel, value: t.privateDuration },
        { label: t.programConditionsLabel, value: t.privateConditions },
      ]} />

      <div className="mb-3">
        <div className="flex items-baseline flex-wrap gap-x-2">
          <span className="text-3xl font-extrabold text-foreground leading-none">{t.privateLessonPrice} LEI</span>
          <span className="text-sm font-semibold text-muted-foreground">{t.privateLessonPer}</span>
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
        <p className="font-medium text-primary mb-1">{t.privatePackageDiscount}</p>
        <p className="text-foreground">
          {t.privatePackageLabel}{" "}
          <span className="text-muted-foreground line-through">{t.privatePackageOriginal}</span>{" "}
          <span className="font-bold text-primary">{t.privatePackageDiscounted}</span>
        </p>
      </div>

      <FeatList items={[t.privateFeat1, t.privateFeat2, t.privateFeat3, t.privateFeat4]} />
      <CtaBlock onClick={() => setInlineForm("private")} label={t.privateRegister} waHref={WA_PRIVATE} />
    </CardShell>
  );

  // === KIDS GROUP CARD ===
  const KidsGroupCard = () => {
    const capLine = kidsCap ? (
      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs rounded-lg border border-border bg-muted/40 px-3 py-2">
        <span className="font-semibold text-foreground">
          {kidsCap.taken}/{kidsCap.max} {t.capSeatsLabel}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className={kidsCap.belowMin ? "text-amber-600 dark:text-amber-500 font-medium" : "text-muted-foreground"}>
          {kidsCap.full
            ? t.capFull
            : kidsCap.belowMin
              ? t.capNeedToStart.replace("{n}", String(kidsCap.needToStart))
              : t.capSpotsLeft.replace("{n}", String(kidsCap.seatsLeft))}
        </span>
      </div>
    ) : null;

    const monthly = 500;
    const total = monthly * 3;
    const disc = total * 0.9;

    return (
      <CardShell
        img={kidsImg}
        alt={t.kidsGroupCardTitle}
        badge={t.kidsBadgeCard}
        title={t.kidsGroupCardTitle}
        subtitle={t.kidsGroupSubtitle}
      >
        {capLine}
        <MetaList items={[
          { label: t.programFormatLabel, value: `${t.kidsGroupFormat} · ${t.kidsOnlineFromAge}` },
          { label: t.programDurationLabel, value: t.kidsGroupDurationNew },
          { label: t.programConditionsLabel, value: t.kidsGroupConditionsNew },
        ]} />

        <div className="mb-3">
          <div className="flex items-baseline flex-wrap gap-x-2">
            <span className="text-3xl font-extrabold text-foreground leading-none">{formatLei(monthly)} LEI</span>
            <span className="text-sm font-semibold text-muted-foreground">/ {t.pricingGroupPerMonth}</span>
          </div>
        </div>
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-muted-foreground">{t.pricingGroup3MonthsLabel}</span>
            <span className="text-muted-foreground line-through">{formatLei(total)} LEI</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="font-medium text-primary">{t.priceTableDiscount}</span>
            <span className="font-bold text-primary whitespace-nowrap">{formatLei(disc)} LEI</span>
          </div>
          <p className="mt-2 text-xs font-medium text-primary">{t.pricingGroupDiscount}</p>
        </div>

        <FeatList items={[t.kidsGroupFeat1New, t.kidsGroupFeat2New, t.kidsGroupFeat3New, t.kidsGroupFeat4New]} />
        <CtaBlock onClick={() => setInlineForm("kids")} label={t.kidsRegister} waHref={WA_KIDS} />
      </CardShell>
    );
  };

  // === KIDS PRIVATE CARD ===
  const KidsPrivateCard = () => (
    <CardShell
      img={privateImg}
      alt={t.kidsPrivateCardTitle}
      badge={t.privateBadge}
      title={t.kidsPrivateCardTitle}
      subtitle={t.kidsPrivateSubtitle}
    >
      <MetaList items={[
        { label: t.programFormatLabel, value: t.kidsPrivateFormat },
        { label: t.programDurationLabel, value: t.kidsPrivateDuration },
        { label: t.programConditionsLabel, value: t.kidsPrivateConditions },
      ]} />

      <div className="mb-3">
        <div className="flex items-baseline flex-wrap gap-x-2">
          <span className="text-3xl font-extrabold text-foreground leading-none">{t.privateLessonPrice} LEI</span>
          <span className="text-sm font-semibold text-muted-foreground">{t.privateLessonPer}</span>
        </div>
      </div>
      <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
        <p className="font-medium text-primary mb-1">{t.privatePackageDiscount}</p>
        <p className="text-foreground">
          {t.privatePackageLabel}{" "}
          <span className="text-muted-foreground line-through">{t.privatePackageOriginal}</span>{" "}
          <span className="font-bold text-primary">{t.privatePackageDiscounted}</span>
        </p>
      </div>

      <FeatList items={[t.kidsPrivateFeat1, t.kidsPrivateFeat2, t.kidsPrivateFeat3, t.kidsPrivateFeat4]} />
      <CtaBlock onClick={() => setInlineForm("kidsPrivate")} label={t.kidsPrivateRegister} waHref={WA_KIDS} />
    </CardShell>
  );

  return (
    <section id="courses" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.programsBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.programsTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.programsDesc}</p>
        </div>

        <Tabs defaultValue="adults" className="w-full">
          <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="adults">{t.tabAdults}</TabsTrigger>
            <TabsTrigger value="kids">{t.tabKids}</TabsTrigger>
          </TabsList>

          <TabsContent value="adults">
            {inlineForm === "group" || inlineForm === "private" ? (
              renderForm(inlineForm)
            ) : (
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <AdultGroupCard />
                <AdultPrivateCard />
              </div>
            )}
          </TabsContent>

          <TabsContent value="kids">
            {inlineForm === "kids" || inlineForm === "kidsPrivate" ? (
              renderForm(inlineForm === "kidsPrivate" ? "kids" : "kids")
            ) : (
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <KidsGroupCard />
                <KidsPrivateCard />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ProgramsSection;
