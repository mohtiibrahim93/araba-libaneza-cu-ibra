import { Gift, Users, UserRound, Baby, CreditCard, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "@/components/LocalizedLink";
import { useI18n } from "@/lib/i18n";
import { getCurriculum } from "@/data/curriculum";
import {
  GROUP_COURSE_MONTHS,
  GROUP_FULL_COURSE_DISCOUNT,
  ONLINE_PRICES,
  PRIVATE_PACKAGE_DISCOUNT,
  PRIVATE_PACKAGE_SIZE,
  discountLabel,
  formatLei,
  physicalPrice,
} from "@/lib/pricing";
import type { LevelType } from "@/components/RegistrationForm/types";

/**
 * Every price in one place. The menu's "Prețuri" used to jump to the home
 * page's course cards, which show "from" prices only.
 *
 * Nothing here is typed by hand: monthly prices, the in-person surcharge, the
 * course length and both discounts come from pricing.ts and lesson counts from
 * the curriculum — the same sources the checkout charges against — so this
 * page cannot quote a price the payment would not take.
 */

const LEVELS: LevelType[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const OPEN = new Set<LevelType>(["A1", "A2"]);

const PreturiPage = () => {
  const { t, lang } = useI18n();
  const en = lang === "en";
  const curriculum = getCurriculum(lang);
  const full = (monthly: number, months: number) =>
    Math.round(monthly * months * (1 - GROUP_FULL_COURSE_DISCOUNT));

  const priv = ONLINE_PRICES.privateLesson;
  const privPack = (unit: number) => Math.round(unit * PRIVATE_PACKAGE_SIZE * (1 - PRIVATE_PACKAGE_DISCOUNT));
  const kidsFizic = physicalPrice(ONLINE_PRICES.kidsGroupMonthly);
  const kidsDeposit = Math.round(kidsFizic * 0.25);

  const card = "rounded-3xl border border-[#E7E1D6] bg-card dark:border-border";
  const label = "mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground";
  const h2 = "font-display text-display-md font-bold text-foreground";
  const icon = "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green";
  const btn =
    "inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90";

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-background px-gutter pb-section pt-28">
        <div className="mx-auto w-full max-w-content">
          <span className={label}>{en ? "Prices" : "Prețuri"}</span>
          <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground">
            {en ? "Course prices" : "Prețurile cursurilor"}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            {en
              ? "All prices are per person, in lei. The first trial lesson is free."
              : "Toate prețurile sunt de persoană, în lei. Prima lecție de probă e gratuită."}{" "}
            {t.priceSurchargeNote}
          </p>

          {/* Quick overview */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              { Icon: Gift, title: en ? "Free trial" : "Lecție de probă", price: "0 lei", sub: "30 min", href: "/trial" },
              {
                Icon: Users,
                title: en ? "Group course" : "Curs de grup",
                price: `${en ? "from" : "de la"} ${formatLei(ONLINE_PRICES.groupMonthly.A1)} lei`,
                sub: en ? "per month, online" : "pe lună, online",
                href: "#grup",
              },
              {
                Icon: UserRound,
                title: en ? "Private lessons" : "Lecții private",
                price: `${formatLei(priv)} lei`,
                sub: en ? "per 60-minute lesson, online" : "lecția de 60 de minute, online",
                href: "#privat",
              },
              {
                Icon: Baby,
                title: en ? "Kids (6–11)" : "Copii (6–11)",
                price: `${formatLei(kidsFizic)} lei`,
                sub: en ? "per month, in person · coming soon" : "pe lună, fizic · în curând",
                href: "#copii",
              },
            ].map(({ Icon, title, price, sub, href }) => (
              <a key={title} href={href} className={`${card} flex flex-col gap-1.5 p-4 transition-colors hover:border-brand-green/50 sm:gap-2 sm:p-5`}>
                <span className={icon}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-1 font-semibold text-foreground">{title}</span>
                <span className="font-display text-2xl font-bold text-foreground sm:text-3xl">{price}</span>
                <span className="text-sm text-muted-foreground">{sub}</span>
              </a>
            ))}
          </div>

          {/* Group */}
          <section id="grup" className="mt-section scroll-mt-28">
            <span className={label}>{en ? "Group course · A1–C2" : "Curs de grup · A1–C2"}</span>
            <h2 className={h2}>{en ? "Small groups: up to 6 online, 8 in person" : "Grupe mici: maximum 6 online, 8 fizic"}</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              {en
                ? `Two 90-minute lessons a week. Pay monthly — it stops automatically at the end of the level — or pay the whole level upfront and get ${discountLabel(GROUP_FULL_COURSE_DISCOUNT)}.`
                : `Două lecții de 90 de minute pe săptămână. Plătești lunar — plata se oprește automat la finalul nivelului — sau plătești tot nivelul în avans, cu ${discountLabel(GROUP_FULL_COURSE_DISCOUNT)}.`}
            </p>
            <div className={`${card} mt-6 hidden overflow-x-auto md:block`}>
              <table className="w-full min-w-[44rem] text-left text-[15px]">
                <thead>
                  <tr className="border-b border-[#E7E1D6] text-sm text-muted-foreground dark:border-border">
                    <th className="px-5 py-4 font-semibold">{en ? "Level" : "Nivel"}</th>
                    <th className="px-5 py-4 font-semibold">{en ? "Lessons" : "Lecții"}</th>
                    <th className="px-5 py-4 font-semibold">{en ? "Length" : "Durată"}</th>
                    <th className="px-5 py-4 font-semibold">{en ? "Per month" : "Pe lună"}</th>
                    <th className="px-5 py-4 font-semibold">
                      {en ? "Whole level upfront" : "Tot nivelul, în avans"} ({discountLabel(GROUP_FULL_COURSE_DISCOUNT)})
                    </th>
                    <th className="px-5 py-4 font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {LEVELS.map((lvl) => {
                    const online = ONLINE_PRICES.groupMonthly[lvl];
                    const fizic = physicalPrice(online);
                    const months = GROUP_COURSE_MONTHS[lvl];
                    const lessons = curriculum.find((c) => c.id === lvl.toLowerCase())?.lessons;
                    return (
                      <tr key={lvl} className="border-b border-[#E7E1D6] last:border-0 dark:border-border">
                        <td className="px-5 py-4">
                          <span className="font-display text-xl font-bold text-foreground">{lvl}</span>
                          {OPEN.has(lvl) && (
                            <span className="ml-2 rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-bold text-brand-green">
                              {en ? "Open" : "Înscrieri deschise"}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">{lessons ?? "—"}</td>
                        <td className="px-5 py-4">
                          {months} {en ? (months === 1 ? "month" : "months") : months === 1 ? "lună" : "luni"}
                        </td>
                        <td className="px-5 py-4">
                          <b>{formatLei(online)}</b> online · <b>{formatLei(fizic)}</b> {en ? "in person" : "fizic"}
                        </td>
                        <td className="px-5 py-4">
                          <b>{formatLei(full(online, months))}</b> online · <b>{formatLei(full(fizic, months))}</b>{" "}
                          {en ? "in person" : "fizic"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/cursuri/grup/${lvl.toLowerCase()}`}
                            className="whitespace-nowrap text-sm font-semibold text-brand-green hover:underline"
                          >
                            {en ? "Details →" : "Detalii →"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Phones: one card per level instead of a table to scroll sideways. */}
            <ul className="mt-6 grid gap-3 md:hidden">
              {LEVELS.map((lvl) => {
                const online = ONLINE_PRICES.groupMonthly[lvl];
                const fizic = physicalPrice(online);
                const months = GROUP_COURSE_MONTHS[lvl];
                const lessons = curriculum.find((c) => c.id === lvl.toLowerCase())?.lessons;
                return (
                  <li key={lvl}>
                    <Link to={`/cursuri/grup/${lvl.toLowerCase()}`} className={`${card} block p-5`}>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-2xl font-bold text-foreground">{lvl}</span>
                        {OPEN.has(lvl) && (
                          <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-bold text-brand-green">
                            {en ? "Open" : "Înscrieri deschise"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {lessons ?? "—"} {en ? "lessons" : "lecții"} · {months} {en ? "months" : "luni"}
                      </p>
                      <p className="mt-3 text-[15px] text-foreground">
                        <b>{formatLei(online)}</b> online · <b>{formatLei(fizic)}</b> {en ? "in person" : "fizic"}{" "}
                        <span className="text-muted-foreground">{en ? "/ month" : "/ lună"}</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {en ? "Whole level upfront" : "Tot nivelul, în avans"} ({discountLabel(GROUP_FULL_COURSE_DISCOUNT)}):{" "}
                        <b className="text-foreground">{formatLei(full(online, months))}</b> online ·{" "}
                        <b className="text-foreground">{formatLei(full(fizic, months))}</b> {en ? "in person" : "fizic"}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Private */}
          <section id="privat" className="mt-section scroll-mt-28 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <span className={label}>{en ? "Private lessons 1:1" : "Lecții private 1:1"}</span>
              <h2 className={h2}>{en ? "At your pace, on your goal" : "În ritmul tău, pe obiectivul tău"}</h2>
              <p className="mt-2 text-muted-foreground">
                {en
                  ? `60-minute lessons, online or in person. ${discountLabel(PRIVATE_PACKAGE_DISCOUNT)} on a package of ${PRIVATE_PACKAGE_SIZE} lessons — no other discount on private lessons. You pay when you book, and the lesson is confirmed once paid.`
                  : `Lecții de 60 de minute, online sau fizic. ${discountLabel(PRIVATE_PACKAGE_DISCOUNT)} la pachetul de ${PRIVATE_PACKAGE_SIZE} de lecții — altă reducere la lecțiile private nu există. Plătești la rezervare, iar lecția e confirmată după plată.`}
              </p>
              <Link to="/cursuri/private#register" className={`${btn} mt-5`}>
                {en ? "Book private lessons →" : "Rezervă lecții private →"}
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`${card} p-6`}>
                <p className="text-sm text-muted-foreground">{en ? "One lesson" : "O lecție"}</p>
                <p className="mt-1 font-display text-3xl font-bold text-foreground">{formatLei(priv)} lei</p>
                <p className="text-sm text-muted-foreground">online</p>
                <p className="mt-3 font-display text-2xl font-bold text-foreground">{formatLei(physicalPrice(priv))} lei</p>
                <p className="text-sm text-muted-foreground">{en ? "in person" : "fizic"}</p>
              </div>
              <div className={`${card} border-brand-green/40 p-6`}>
                <p className="text-sm text-muted-foreground">
                  {en ? `Package of ${PRIVATE_PACKAGE_SIZE}` : `Pachet de ${PRIVATE_PACKAGE_SIZE}`} ·{" "}
                  <span className="font-semibold text-brand-green">{discountLabel(PRIVATE_PACKAGE_DISCOUNT)}</span>
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-foreground">{formatLei(privPack(priv))} lei</p>
                <p className="text-sm text-muted-foreground">
                  online · <s>{formatLei(priv * PRIVATE_PACKAGE_SIZE)}</s>
                </p>
                <p className="mt-3 font-display text-2xl font-bold text-foreground">
                  {formatLei(privPack(physicalPrice(priv)))} lei
                </p>
                <p className="text-sm text-muted-foreground">
                  {en ? "in person" : "fizic"} · <s>{formatLei(physicalPrice(priv) * PRIVATE_PACKAGE_SIZE)}</s>
                </p>
              </div>
            </div>
          </section>

          {/* Trial + kids */}
          <section className="mt-section grid gap-5 md:grid-cols-2">
            <div className={`${card} flex flex-col gap-3 p-6 sm:p-7`}>
              <span className={icon}>
                <Gift className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-bold text-foreground">
                {en ? "Free trial lesson — 0 lei" : "Lecția de probă — 0 lei"}
              </h2>
              <p className="text-foreground/80">
                {en
                  ? "30 minutes with Ibra: we meet, you ask anything, and we find your level. Once per person."
                  : "30 de minute cu Ibra: ne cunoaștem, întrebi orice și îți aflăm nivelul. O singură dată de persoană."}
              </p>
              <Link to="/trial" className="mt-auto text-sm font-semibold text-brand-green hover:underline">
                {en ? "Book the free trial →" : "Rezervă lecția gratuită →"}
              </Link>
            </div>
            <div id="copii" className={`${card} flex scroll-mt-28 flex-col gap-3 p-6 sm:p-7`}>
              <span className={icon}>
                <Baby className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-bold text-foreground">
                {en ? "Kids (6–11) — coming soon" : "Copii (6–11) — în curând"}
              </h2>
              <p className="text-foreground/80">
                {en
                  ? `In person in Bucharest, ${formatLei(kidsFizic)} lei a month. When a group opens, a refundable ${formatLei(kidsDeposit)} lei deposit (25%) keeps the place.`
                  : `Fizic, în București, ${formatLei(kidsFizic)} lei pe lună. Când se deschide o grupă, un avans rambursabil de ${formatLei(kidsDeposit)} lei (25%) păstrează locul.`}
              </p>
              <Link to="/cursuri/copii" className="mt-auto text-sm font-semibold text-brand-green hover:underline">
                {en ? "Get notified when it starts →" : "Anunță-mă când pornește →"}
              </Link>
            </div>
          </section>

          {/* How to pay */}
          <section className="mt-section grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-cream p-6 sm:p-8">
              <div className="mb-3 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-brand-green" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-foreground">{en ? "How you pay" : "Cum plătești"}</h2>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-foreground/80">
                <li>
                  {en
                    ? "By card online, securely through Stripe (card, Apple Pay or Google Pay)."
                    : "Cu cardul, online, securizat prin Stripe (card, Apple Pay sau Google Pay)."}
                </li>
                <li>
                  {en ? "Or: " : "Sau: "}
                  {t.paymentCash}; {t.paymentTransfer.toLowerCase()}; {t.paymentPaypal}. {t.paymentNote}
                </li>
              </ul>
            </div>
            <div className="rounded-3xl bg-cream p-6 sm:p-8">
              <div className="mb-3 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-brand-green" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-foreground">{en ? "Refunds" : "Rambursare"}</h2>
              </div>
              <p className="text-foreground/80">{t.trustRefund}.</p>
              <Link to="/terms" className="mt-3 inline-block text-sm font-semibold text-brand-green hover:underline">
                {en ? "Terms and conditions →" : "Termeni și condiții →"}
              </Link>
            </div>
          </section>

          <section className="mt-section flex flex-col gap-5 rounded-3xl bg-brand-green px-6 py-8 text-white sm:px-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {en ? "Not sure which one? Start free." : "Nu știi ce să alegi? Începe gratuit."}
              </h2>
              <p className="mt-1 text-white/85">
                {en ? "30 minutes, 0 lei — we find the right course together." : "30 de minute, 0 lei — găsim împreună cursul potrivit."}
              </p>
            </div>
            <Link
              to="/trial"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 font-semibold text-brand-green transition-opacity hover:opacity-90"
            >
              {en ? "Book the free trial →" : "Rezervă lecția gratuită →"}
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PreturiPage;
