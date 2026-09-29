import { useI18n } from "@/lib/i18n";
import { BrandMark } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

/**
 * "This is what your first conversation looks like" — two phones with real
 * Lebanese chats in Arabizi, the card that sits beside the hero photo.
 *
 * The chats are the owner's own, spelled the way he spells them: stretched
 * vowels (3aamel, 3ann-naaar, d2eeye2) are deliberate, they mirror speech. The
 * Arabizi stays the same in every language; only the small glosses under the
 * coffee chat are translated.
 */

type Tone = "beige" | "green" | "red" | "gold";

const TONE: Record<Tone, string> = {
  beige: "bg-[#EFEAE0] text-[#1A1A1A]",
  green: "bg-[#204F3A] text-white",
  red: "bg-[#DC2828] text-white",
  gold: "bg-[#E9C77B] text-[#1A1A1A]",
};

interface Bubble {
  text: string;
  tone: Tone;
  /** Received messages sit on the left, sent ones on the right. */
  side: "left" | "right";
  gloss?: { ro: string; en: string };
}

const CINEMA: Bubble[] = [
  { text: "shu 3aamel liom", tone: "beige", side: "left" },
  { text: "3am fakker ruu7 e7dar filem bi-s-cinema , enta ?", tone: "green", side: "right" },
  { text: "ma shi, ma 3ande msheeri3..", tone: "red", side: "left" },
  { text: "baddak teje ma3e ne7dar shi?", tone: "green", side: "right" },
  { text: "shu?", tone: "gold", side: "left" },
  { text: "Nezel filem spiderman L-jdeed, kent 3am fakker e7daro", tone: "green", side: "right" },
  { text: "yalla, I m in", tone: "red", side: "left" },
];

const COFFEE: Bubble[] = [
  {
    text: "7ott er-rakwe 3ann-naaar. 10 d2eeye2 w bkun 3andak",
    tone: "beige",
    side: "left",
    gloss: {
      ro: "Pune ibricul pe foc. În 10 minute sunt la tine. (rakwe = ibricul de cafea. Adică: pune apa la fiert, ca s-o bem proaspătă când ajung.)",
      en: "Put the coffee pot on the fire. I'll be with you in 10 minutes. (rakwe = the coffee pot. Meaning: put the water on to boil, so we drink it fresh when I arrive.)",
    },
  },
  {
    text: "ahla w sahla, yalla natrak",
    tone: "green",
    side: "right",
    gloss: {
      ro: "Bine ai venit (mot-a-mot) / cu drag (trad. sensul), te aștept!",
      en: "Welcome (word for word) / with pleasure (the sense), I'm waiting for you!",
    },
  },
];

const Phone = ({ bubbles, lang }: { bubbles: Bubble[]; lang: "ro" | "en" }) => (
  <div className="w-full max-w-[11.5rem] rounded-[1.9rem] bg-[#1A1A1A] p-2 shadow-[0_12px_28px_rgba(26,26,26,0.16)]">
    <div className="relative flex h-full flex-col gap-1.5 overflow-hidden rounded-[1.45rem] bg-[#FFFDF8] px-2 pb-3 pt-8 text-[#1A1A1A]">
      <span aria-hidden="true" className="absolute left-1/2 top-2 h-4 w-14 -translate-x-1/2 rounded-full bg-[#1A1A1A]" />
      <div className="mb-0.5 flex items-center gap-1.5 border-b border-[#EFEAE0] pb-1.5">
        <BrandMark className="h-6 w-6 shrink-0" />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="font-display text-[10px] font-bold">Centrul de Arabă Libaneză</span>
          <span className="text-[9px] font-semibold text-[#204F3A]">Ibra · online</span>
        </div>
      </div>
      {bubbles.map((b) => (
        <div
          key={b.text}
          className={cn(
            "flex max-w-[88%] flex-col gap-0.5",
            b.side === "left" ? "items-start self-start" : "items-end self-end",
          )}
        >
          <span
            lang="apc-Latn"
            className={cn(
              "px-2 py-1 text-[11px] font-semibold leading-snug",
              TONE[b.tone],
              b.side === "left" ? "rounded-[13px_13px_13px_4px]" : "rounded-[13px_13px_4px_13px]",
            )}
          >
            {b.text}
          </span>
          {b.gloss && (
            <span className="px-1 text-[8.5px] italic leading-snug text-[#8A857B]">{b.gloss[lang]}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

const HeroConversation = ({ className }: { className?: string }) => {
  const { t, lang } = useI18n();
  const l = lang === "en" ? "en" : "ro";
  return (
    <figure
      className={cn(
        "rounded-3xl border border-border bg-card p-5 shadow-[0_12px_32px_rgba(26,26,26,0.06)]",
        className,
      )}
    >
      <figcaption className="mb-4 flex flex-col gap-1.5">
        <span className="font-display text-xl font-bold leading-tight text-foreground">
          {l === "en" ? "This is what your first conversation looks like." : "Așa arată prima ta conversație."}
        </span>
        <span className="text-sm leading-relaxed text-muted-foreground">
          {l === "en"
            ? "In Arabizi, from the first lesson — no alphabet to learn first."
            : "În Arabizi, din prima lecție — fără alfabet de învățat înainte."}
        </span>
      </figcaption>
      <div className="flex items-stretch justify-center gap-3">
        <Phone bubbles={CINEMA} lang={l} />
        <Phone bubbles={COFFEE} lang={l} />
      </div>
      {/* The rating and the starting price, moved here from the row under the
          hero buttons (the owner's choice). */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
        <span>
          <b className="text-foreground">5.0</b>{" "}
          <span className="text-[#B8892E]" aria-hidden="true">★★★★★</span>{" "}
          {t.heroStat1}
        </span>
        <span aria-hidden="true" className="hidden sm:inline">·</span>
        <span>{t.heroTrustStudents}</span>
      </div>
    </figure>
  );
};

export default HeroConversation;
