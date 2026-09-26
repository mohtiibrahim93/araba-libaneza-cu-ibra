import { Link, useSearchParams } from "@/lib/router-compat";
import { ChevronRight, GraduationCap, User, Baby, Wifi, MapPin, Users, UserRound, Loader2, Sparkles, Building2, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import CourseCard from "@/components/courses/CourseCard";
import NotifyMeForm from "@/components/NotifyMeForm";
import { useCourses } from "@/hooks/useCourses";
import { useI18n } from "@/lib/i18n";
import { AGE_LABELS, MODALITY_LABELS, type AgeCategory, type Modality } from "@/lib/courses";

const BASE_URL = "https://centruldearabalibaneza.com";
const WHATSAPP_URL = "https://wa.me/40763124514";

type Choice = { value: string; icon: typeof GraduationCap; ro: string; en: string; note?: { ro: string; en: string } };

const AGES: Choice[] = [
  { value: "adulti", icon: GraduationCap, ro: "Adulți", en: "Adults", note: { ro: "18+ ani", en: "18+" } },
  { value: "adolescenti", icon: User, ro: "Adolescenți", en: "Teens", note: { ro: "12–17 ani", en: "Ages 12–17" } },
  { value: "copii", icon: Baby, ro: "Copii", en: "Kids", note: { ro: "6–11 ani", en: "Ages 6–11" } },
];
const MODES: Choice[] = [
  { value: "online", icon: Wifi, ro: "Online", en: "Online", note: { ro: "Live pe Zoom, de oriunde", en: "Live on Zoom, anywhere" } },
  { value: "fizic", icon: MapPin, ro: "Fizic, în București", en: "In person, Bucharest", note: { ro: "Strada Icoanei 80", en: "Str. Icoanei 80" } },
];
const TYPES: Choice[] = [
  { value: "grup", icon: Users, ro: "Grup", en: "Group", note: { ro: "max. 6 online / 10 fizic, preț mai mic", en: "max 6 online / 10 in person, lower price" } },
  { value: "privat", icon: UserRound, ro: "Privat", en: "Private", note: { ro: "1:1, program flexibil", en: "1:1, flexible schedule" } },
];

const Cursuri = () => {
  const { t, lang } = useI18n();
  const [params, setParams] = useSearchParams();
  // Head served by the route (src/lib/seoHead.ts). Written here as well, it
  // put a second title and description in the same HTML.
  const L = (o: { ro: string; en: string }) => (lang === "en" ? o.en : o.ro);

  const age = params.get("varsta");
  const mode = params.get("mod");
  const type = params.get("tip");

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    setParams(next);
  };

  const step = !age ? 1 : !mode ? 2 : !type ? 3 : 4;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="main-content" className="pt-16">
        <nav aria-label={t.courseBreadcrumbCourses} className="w-full max-w-content mx-auto px-gutter pt-6 pb-2 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link to="/" className="hover:text-foreground">{t.courseBreadcrumbHome}</Link></li>
            <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
            <li className="text-foreground font-medium" aria-current="page">{t.courseBreadcrumbCourses}</li>
          </ol>
        </nav>

        <section className="w-full max-w-content mx-auto px-gutter pt-4 pb-2 text-center">
          <span className="text-sm font-medium text-primary mb-2 block">{t.programsBadge}</span>
          <h1 className="text-display-xl font-bold tracking-tight text-foreground mb-3">
            {lang === "en" ? "Find the right course" : "Găsește cursul potrivit"}
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {lang === "en"
              ? "Answer three quick questions and we'll show you the right courses — or request a private lesson tailored to you."
              : "Răspunde la trei întrebări scurte și îți arătăm cursurile potrivite — sau ceri o lecție privată adaptată ție."}
          </p>
        </section>

        {step > 1 && (
          <div className="w-full max-w-content mx-auto px-gutter mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
            {age && <button onClick={() => set({ varsta: null, mod: null, tip: null })} className="rounded-full border border-border bg-muted/40 px-3 py-1 hover:border-primary/40">{L(AGE_LABELS[age as AgeCategory])} ✕</button>}
            {mode && <button onClick={() => set({ mod: null, tip: null })} className="rounded-full border border-border bg-muted/40 px-3 py-1 hover:border-primary/40">{L(MODALITY_LABELS[mode as Modality])} ✕</button>}
            {type && <button onClick={() => set({ tip: null })} className="rounded-full border border-border bg-muted/40 px-3 py-1 hover:border-primary/40">{L(TYPES.find((x) => x.value === type)!)} ✕</button>}
          </div>
        )}

        <section className="w-full max-w-content mx-auto px-gutter py-8">
          {step === 1 && <StepGrid title={lang === "en" ? "Who is the course for?" : "Pentru cine este cursul?"} choices={AGES} onPick={(v) => set({ varsta: v })} L={L} />}
          {step === 2 && <StepGrid title={lang === "en" ? "How would you like to attend?" : "Cum vrei să participi?"} choices={MODES} onPick={(v) => set({ mod: v })} L={L} />}
          {step === 3 && <StepGrid title={lang === "en" ? "What type of course?" : "Ce tip de curs cauți?"} choices={TYPES} onPick={(v) => set({ tip: v })} L={L} />}
          {step === 4 && type === "privat" && <PrivateCta age={age!} mode={mode!} lang={lang} />}
          {step === 4 && type === "grup" && age === "copii" && <KidsGroupNotice mode={mode!} lang={lang} />}
          {step === 4 && type === "grup" && age !== "copii" && <GroupResults age={age!} mode={mode!} lang={lang} />}
        </section>

        {/* Preserved helper: don't know your level */}
        <section className="w-full max-w-content mx-auto px-gutter pb-16">
          <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
            <h2 className="text-display-md font-bold text-foreground mb-2">{t.dontKnowLevelTitle}</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{t.dontKnowLevelDesc}</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link to="/quiz" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
                <Sparkles className="w-5 h-5 text-primary mb-2" />
                <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptQuizTitle}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptQuizDesc}</p>
                <span className="text-xs font-medium text-primary inline-flex items-center gap-1">{t.dontKnowOptQuizTitle} <ChevronRight className="w-3.5 h-3.5" /></span>
              </Link>
              <Link to="/trial" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
                <Building2 className="w-5 h-5 text-primary mb-2" />
                <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptTestTitle}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptTestDesc}</p>
                <span className="text-xs font-medium text-primary inline-flex items-center gap-1">{t.dontKnowOptTestTitle} <ChevronRight className="w-3.5 h-3.5" /></span>
              </Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
                <MessageCircle className="w-5 h-5 text-primary mb-2" />
                <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptWhatsAppTitle}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptWhatsAppDesc}</p>
                <span className="text-xs font-medium text-primary inline-flex items-center gap-1">WhatsApp <ChevronRight className="w-3.5 h-3.5" /></span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

const StepGrid = ({ title, choices, onPick, L }: { title: string; choices: Choice[]; onPick: (v: string) => void; L: (o: { ro: string; en: string }) => string }) => (
  <div>
    <h2 className="mb-5 text-center text-xl font-bold text-foreground">{title}</h2>
    <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
      {choices.map(({ value, icon: Icon, ro, en, note }) => (
        <button
          key={value}
          onClick={() => onPick(value)}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 text-center transition hover:border-primary/50 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary/15">
            <Icon className="h-6 w-6" />
          </span>
          <span className="text-base font-semibold text-foreground">{L({ ro, en })}</span>
          {note && <span className="text-xs text-muted-foreground">{L(note)}</span>}
        </button>
      ))}
    </div>
  </div>
);

const GroupResults = ({ age, mode, lang }: { age: string; mode: string; lang: "ro" | "en" }) => {
  const { courses, loading } = useCourses({ age, format: mode, courseType: "grup" });
  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> {lang === "en" ? "Loading courses…" : "Se încarcă cursurile…"}</div>;
  }
  if (courses.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <p className="mb-2 font-semibold text-foreground">{lang === "en" ? "No open group courses here yet" : "Momentan nu sunt grupe deschise aici"}</p>
        <p className="mb-4 text-sm text-muted-foreground">{lang === "en" ? "New groups open regularly. Message us and we'll tell you when the next one starts." : "Deschidem grupe noi periodic. Scrie-ne și îți spunem când începe următoarea."}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">WhatsApp</a>
          <Link to="/trial" className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">{lang === "en" ? "Book a free trial" : "Probă gratuită"}</Link>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 className="mb-5 text-center text-xl font-bold text-foreground">{lang === "en" ? "Available group courses" : "Cursuri de grup disponibile"}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
};

const PrivateCta = ({ age, mode, lang }: { age: string; mode: string; lang: "ro" | "en" }) => (
  <div className="mx-auto max-w-xl rounded-2xl border border-border bg-primary/5 p-8 text-center">
    <UserRound className="mx-auto mb-3 h-10 w-10 text-primary" />
    <h2 className="mb-2 text-xl font-bold text-foreground">{lang === "en" ? "Private lessons, tailored to you" : "Lecții private, adaptate ție"}</h2>
    <p className="mb-5 text-sm text-muted-foreground">
      {lang === "en"
        ? "1-on-1 with a native teacher, your own pace and schedule. Read how it works and request a slot."
        : "1:1 cu profesor nativ, în ritmul și programul tău. Vezi cum funcționează și cere o programare."}
    </p>
    <Link to={`/cursuri/privat?varsta=${age}&mod=${mode}`} className="inline-flex items-center gap-1 rounded-lg bg-primary px-gutter py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
      {lang === "en" ? "See private lessons" : "Vezi cursurile private"} <ChevronRight className="h-4 w-4" />
    </Link>
  </div>
);

const KidsGroupNotice = ({ mode, lang }: { mode: string; lang: "ro" | "en" }) => (
  <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
    <Baby className="mx-auto mb-3 h-10 w-10 text-primary" />
    <h2 className="mb-2 text-xl font-bold text-foreground">
      {lang === "en" ? "Kids' group courses aren't open yet" : "Cursurile de grup pentru copii nu sunt încă disponibile"}
    </h2>
    <p className="mb-4 text-sm text-muted-foreground">
      {lang === "en"
        ? "We open kids' groups when there's enough interest. Private lessons for children are available now — or leave your details and we'll tell you when a group opens."
        : "Deschidem grupe pentru copii când sunt suficienți cursanți. Lecțiile private pentru copii sunt disponibile acum — sau lasă-ne datele și îți spunem când se deschide o grupă."}
    </p>
    <div className="mb-6">
      <Link to={`/cursuri/privat?varsta=copii&mod=${mode}`} className="inline-flex items-center gap-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        {lang === "en" ? "See private lessons for kids" : "Vezi lecțiile private pentru copii"} <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
    <div className="border-t border-border pt-5 text-left">
      <p className="mb-3 text-center text-sm font-semibold text-foreground">
        {lang === "en" ? "Notify me when a kids' group opens" : "Anunță-mă când se deschide o grupă pentru copii"}
      </p>
      <NotifyMeForm context="kids_group" />
    </div>
  </div>
);

export default Cursuri;
