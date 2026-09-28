import { useI18n } from "@/lib/i18n";
import { Link } from "@/components/LocalizedLink";

/**
 * "Scrii cum auzi" — four everyday phrases in Arabizi, with the Arabic script
 * beside them and the meaning.
 *
 * Arabizi is how the course is taught; the Arabic script is shown here as an
 * example only. In lessons it appears just for students who also learn the
 * alphabet (optional, from B1 or B2) — the paragraph says so, so the page does
 * not promise script in every lesson.
 *
 * Spellings are the owner's (mnee7, not mni7/mnih). Audio buttons come when
 * the owner's recordings do.
 */

const PHRASES: { arabizi: string; arabic: string; ro: string; en: string }[] = [
  { arabizi: "Yalla!", arabic: "يلّا!", ro: "Hai! / Să mergem!", en: "Come on! / Let's go!" },
  { arabizi: "Mnee7, merci", arabic: "منيح، مرسي", ro: "Bine, mulțumesc", en: "Good, thanks" },
  { arabizi: "Ahla w sahla", arabic: "أهلا وسهلا", ro: "Bine ai venit", en: "Welcome" },
  { arabizi: "Shu esmak?", arabic: "شو اسمك؟", ro: "Cum te cheamă?", en: "What's your name?" },
];

const ArabiziShowcase = () => {
  const { lang } = useI18n();
  const en = lang === "en";

  return (
    <section className="py-section px-gutter bg-background">
      <div className="w-full max-w-content mx-auto grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 items-center">
        <div>
          <span className="mb-3 block text-sm font-semibold uppercase tracking-wide text-primary">
            {en ? "Arabizi, with the Arabic script alongside" : "Arabizi, cu scrierea arabă alături"}
          </span>
          <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-4">
            {en ? "Write what you hear. No alphabet to learn first." : "Scrii cum auzi. Fără alfabet de învățat înainte."}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 max-w-xl">
            {en
              ? "Lessons are in Arabizi: Lebanese written in Latin letters and numbers (7 = ح). The Arabic script appears in lessons only if you also learn the alphabet — optional, from B1 or B2. Here we show it alongside, so you can see what each phrase looks like."
              : "Lecțiile sunt în Arabizi: libaneza scrisă cu litere latine și cifre (7 = ح). Scrierea arabă apare la lecții doar dacă înveți și alfabetul — opțional, de la B1 sau B2. Aici ți-o arătăm alături, ca să vezi cum arată fiecare expresie."}
          </p>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-cream px-5 py-4 max-w-xl">
            <span className="font-display text-2xl font-bold text-primary whitespace-nowrap" aria-hidden="true">
              7 · 3 · 2
            </span>
            <span className="text-sm text-muted-foreground leading-relaxed">
              {en
                ? "In Arabizi the numbers stand for sounds English doesn't have."
                : "Cifrele din Arabizi țin locul sunetelor care nu există în română."}{" "}
              <Link to="/arabizi" className="font-medium text-primary hover:underline underline-offset-4">
                {en ? "The full Arabizi guide →" : "Ghidul complet Arabizi →"}
              </Link>
            </span>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {PHRASES.map((p) => (
            <li key={p.arabizi} className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col gap-1.5">
              <span lang="apc-Latn" className="text-lg sm:text-2xl font-bold text-foreground">{p.arabizi}</span>
              <span dir="rtl" lang="ar" className="font-arabic text-xl sm:text-2xl text-muted-foreground text-left">
                {p.arabic}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-brand-green">{en ? p.en : p.ro}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ArabiziShowcase;
