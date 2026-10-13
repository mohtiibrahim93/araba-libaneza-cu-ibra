import { useI18n } from "@/lib/i18n";
import { BrandMark } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

/**
 * "This is what your first conversation looks like" — two phones with real
 * Lebanese chats in Arabizi, the card that sits beside the hero photo.
 *
 * The chats are the owner's own, spelled the way he spells them: stretched
 * vowels (3aamel, 3ann-naaar, d2eeye2) are deliberate, they mirror speech. The
 * Arabizi stays the same in every language; the small glosses under every
 * bubble are translated (owner's request, 13 October 2026: both phones carry
 * a Romanian translation).
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
  {
    text: "shu 3aamel liom",
    tone: "beige",
    side: "left",
    gloss: { ro: "Ce faci azi?", en: "What are you up to today?" },
  },
  {
    text: "3am fakker ruu7 e7dar filem bi-s-cinema , enta ?",
    tone: "green",
    side: "right",
    gloss: {
      ro: "Mă gândesc să merg la un film la cinema. Tu?",
      en: "I'm thinking of going to see a film at the cinema. You?",
    },
  },
  {
    text: "ma shi, ma 3ande msheeri3..",
    tone: "red",
    side: "left",
    gloss: { ro: "Nimic, n-am planuri…", en: "Nothing, I've got no plans…" },
  },
  {
    text: "baddak teje ma3e ne7dar shi?",
    tone: "green",
    side: "right",
    gloss: {
      ro: "Vrei tu (m.) să vii cu mine să vedem ceva?",
      en: "Do you (m.) want to come with me and watch something?",
    },
  },
  {
    text: "shu?",
    tone: "gold",
    side: "left",
    gloss: { ro: "Ce anume?", en: "What?" },
  },
  {
    text: "Nezel filem spiderman L-jdeed, kenet 3am fakker e7daro",
    tone: "green",
    side: "right",
    gloss: {
      ro: "A ieșit noul Spiderman, mă gândeam să-l văd.",
      en: "The new Spiderman is out, I was thinking of watching it.",
    },
  },
  {
    text: "yalla, I m in",
    tone: "red",
    side: "left",
    gloss: { ro: "Hai, vin și eu!", en: "Come on, I'm in!" },
  },
];

const COFFEE: Bubble[] = [
  {
    text: "7ott er-rakwe 3ann-naaar. 10 d2eeye2 w bkun 3andak",
    tone: "beige",
    side: "left",
    gloss: {
      ro: "Pune ibricul pe foc. În 10 minute sunt la tine. (rakwe = ibricul de cafea. Adică: pune apa la fiert, ca să bem cafeaua proaspătă când ajung.)",
      en: "Put the coffee pot on the fire. I'll be with you in 10 minutes. (rakwe = the coffee pot. Meaning: put the water on to boil, so we drink the coffee fresh when I arrive.)",
    },
  },
  {
    text: "ahla w sahla, yalla natrak",
    tone: "green",
    side: "right",
    gloss: {
      ro: "Mot-a-mot: ești familie și drum lin. Adică: bine ai venit / cu drag. Te aștept!",
      en: "Word for word: you are family, and may your road be easy. Meaning: welcome / with pleasure. I'm waiting for you!",
    },
  },
];

/**
 * One phone. A real phone's proportions (about 9:19) whatever the chat's
 * length, with a status bar and a message bar, so a short chat reads as a
 * phone with room left on its screen rather than as a short box. Both phones
 * stand side by side at the same height from sm up.
 */
const Phone = ({ bubbles, lang }: { bubbles: Bubble[]; lang: "ro" | "en" }) => (
  <div className="flex min-h-[27rem] w-full max-w-[17rem] flex-col rounded-[2.2rem] bg-[#1A1A1A] p-[7px] shadow-[0_14px_32px_rgba(26,26,26,0.18)] sm:min-h-[32rem] sm:max-w-[15.5rem] sm:flex-1">
    <div className="relative flex grow flex-col overflow-hidden rounded-[1.8rem] bg-[#FFFDF8] text-[#1A1A1A]">
      {/* Status bar around the camera island. */}
      <div
        aria-hidden="true"
        className="flex items-center justify-between px-5 pt-2 text-[9px] font-semibold"
      >
        <span>9:41</span>
        <span className="h-[18px] w-16 rounded-full bg-[#1A1A1A]" />
        <span className="flex items-center gap-1">
          <span className="inline-flex items-end gap-[1.5px]">
            <span className="h-[3px] w-[2px] rounded-sm bg-current" />
            <span className="h-[5px] w-[2px] rounded-sm bg-current" />
            <span className="h-[7px] w-[2px] rounded-sm bg-current" />
          </span>
          <span className="relative h-[7px] w-[14px] rounded-[2px] border border-current">
            <span className="absolute inset-[1px] right-[3px] rounded-[1px] bg-current" />
          </span>
        </span>
      </div>
      <div className="mx-2 mt-1.5 flex items-center gap-1.5 border-b border-[#EFEAE0] pb-1.5">
        <BrandMark className="h-6 w-6 shrink-0" />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="font-display text-[10px] font-bold">
            Centrul de Arabă Libaneză
          </span>
          <span className="text-[9px] font-semibold text-[#204F3A]">
            Ibra · online
          </span>
        </div>
      </div>
      <div className="flex grow flex-col gap-1.5 px-2 pt-2">
        {bubbles.map((b) => (
          <div
            key={b.text}
            className={cn(
              "flex max-w-[88%] flex-col gap-0.5",
              b.side === "left"
                ? "items-start self-start"
                : "items-end self-end",
            )}
          >
            <span
              lang="apc-Latn"
              className={cn(
                "px-2 py-1 text-[11px] font-semibold leading-snug",
                TONE[b.tone],
                b.side === "left"
                  ? "rounded-[13px_13px_13px_4px]"
                  : "rounded-[13px_13px_4px_13px]",
              )}
            >
              {b.text}
            </span>
            {b.gloss && (
              <span className="px-1 text-[8.5px] italic leading-snug text-[#8A857B]">
                {b.gloss[lang]}
              </span>
            )}
          </div>
        ))}
      </div>
      {/* Message bar and home indicator. */}
      <div
        aria-hidden="true"
        className="mx-2 mb-1.5 mt-2 flex items-center gap-1.5"
      >
        <span className="flex-1 rounded-full border border-[#E5DFD3] bg-white px-2.5 py-1 text-[9px] text-[#A9A397]">
          {lang === "en" ? "Message" : "Mesaj"}
        </span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#204F3A] text-[9px] text-white">
          ➤
        </span>
      </div>
      <span
        aria-hidden="true"
        className="mx-auto mb-1.5 h-1 w-16 rounded-full bg-[#1A1A1A]/80"
      />
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
          {l === "en"
            ? "This is what your first conversation looks like."
            : "Așa arată prima ta conversație."}
        </span>
        <span className="text-sm leading-relaxed text-muted-foreground">
          {l === "en"
            ? "In Arabizi, from the first lesson — no alphabet to learn first."
            : "În Arabizi, din prima lecție — fără alfabet de învățat înainte."}
        </span>
      </figcaption>
      {/* Phones stack on a narrow screen, so each is wide enough for the
          bubbles not to wrap word by word; side by side from sm up. */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch sm:justify-center">
        <Phone bubbles={CINEMA} lang={l} />
        <Phone bubbles={COFFEE} lang={l} />
      </div>
      {/* The rating and the starting price, moved here from the row under the
          hero buttons (the owner's choice). */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
        <span>
          <b className="text-foreground">5.0</b>{" "}
          <span className="text-[#B8892E]" aria-hidden="true">
            ★★★★★
          </span>{" "}
          {t.heroStat1}
        </span>
        <span aria-hidden="true" className="hidden sm:inline">
          ·
        </span>
        <span>{t.heroTrustStudents}</span>
      </div>
    </figure>
  );
};

export default HeroConversation;
