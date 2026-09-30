import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
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
 * Spellings are the owner's (mnee7, not mni7/mnih). The recordings are the
 * owner's own voice, in public/audio.
 */

const PHRASES: { arabizi: string; arabic: string; ro: string; en: string; audio: string }[] = [
  { arabizi: "Yalla!", arabic: "يلّا!", ro: "Hai! / Să mergem!", en: "Come on! / Let's go!", audio: "/audio/yalla.m4a" },
  { arabizi: "Mnee7, merci", arabic: "منيح، مرسي", ro: "Bine, mulțumesc", en: "Good, thanks", audio: "/audio/mnee7-merci.m4a" },
  { arabizi: "Ahla w sahla", arabic: "أهلا وسهلا", ro: "Bine ai venit", en: "Welcome", audio: "/audio/ahla-w-sahla.m4a" },
  { arabizi: "Shu esmak?", arabic: "شو اسمك؟", ro: "Cum te cheamă?", en: "What's your name?", audio: "/audio/shu-esmak.m4a" },
];

const ArabiziShowcase = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  // One player for the whole grid, so starting a phrase stops the previous one.
  const player = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const toggle = (src: string) => {
    if (typeof Audio === "undefined") return;
    const current = player.current;
    if (current && playing === src) {
      current.pause();
      setPlaying(null);
      return;
    }
    current?.pause();
    const next = new Audio(src);
    next.onended = () => setPlaying(null);
    next.onerror = () => setPlaying(null);
    player.current = next;
    setPlaying(src);
    void next.play().catch(() => setPlaying(null));
  };

  return (
    <section className="py-section px-gutter bg-cream">
      <div className="w-full max-w-content mx-auto grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 items-center">
        <div>
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
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
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 max-w-xl">
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
              <div className="flex items-start justify-between gap-2">
                <span lang="apc-Latn" className="text-lg sm:text-2xl font-bold text-foreground">{p.arabizi}</span>
                <button
                  type="button"
                  onClick={() => toggle(p.audio)}
                  aria-label={`${en ? "Listen" : "Ascultă"}: ${p.arabizi}`}
                  aria-pressed={playing === p.audio}
                  className="inline-flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-border bg-cream text-brand-green transition-colors hover:border-brand-green"
                >
                  {playing === p.audio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
                </button>
              </div>
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
