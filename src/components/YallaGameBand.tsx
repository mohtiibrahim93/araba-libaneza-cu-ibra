import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "@/components/LocalizedLink";
import { cn } from "@/lib/utils";

/**
 * "Joacă Yalla" — the practice game's own band on the home page, with one
 * sample question you can answer on the spot.
 *
 * The sample is a taste, not the game: it lives here, answers once, then points
 * to /joc. The game itself is in Romanian only, so the English copy says so.
 */

const ANSWERS: { arabizi: string; arabic: string; correct: boolean }[] = [
  { arabizi: "Ahla w sahla", arabic: "أهلا وسهلا", correct: true },
  { arabizi: "Yalla", arabic: "يلّا", correct: false },
  { arabizi: "Kifak?", arabic: "كيفك؟", correct: false },
];

const YallaGameBand = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const right = answered && ANSWERS[picked]?.correct === true;

  return (
    <section className="py-section px-gutter bg-background">
      <div className="w-full max-w-content mx-auto grid gap-10 rounded-[28px] bg-[#204F3A] px-6 py-10 text-white sm:px-10 lg:grid-cols-12 lg:gap-6 lg:px-16 lg:py-14 items-center">
        <div className="flex flex-col gap-4 lg:col-span-6">
          <span className="text-sm font-bold uppercase tracking-[0.1em] text-[#E9C77B]">
            {en ? "Free · no account" : "Gratuit · fără cont"}
          </span>
          <h2 className="font-display text-display-lg font-bold leading-tight">
            {en ? "Play Yalla. 4,300+ expressions, right in your browser." : "Joacă Yalla. 4.300+ expresii, direct în browser."}
          </h2>
          <p className="text-[17px] leading-relaxed text-[#CFE0D6]">
            {en
              ? "Scheduled reviews, so you don't forget what you've learned. Two minutes a day is enough. The game is in Romanian."
              : "Recapitulări programate, ca să nu uiți ce ai învățat. Două minute pe zi sunt suficiente."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/joc"
              className="inline-flex h-[52px] items-center rounded-xl bg-white px-6 font-bold text-[#204F3A] transition-opacity hover:opacity-90"
            >
              {en ? "Play now →" : "Joacă acum →"}
            </Link>
            <Link
              to="/test-de-nivel"
              className="inline-flex h-[52px] items-center rounded-xl border-[1.5px] border-white px-6 font-semibold text-white transition-colors hover:bg-white/10"
            >
              {en ? "Find your level" : "Află-ți nivelul"}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 rounded-[22px] bg-white p-6 text-[#1A1A1A] sm:p-7 lg:col-span-5 lg:col-start-8">
          <div className="flex justify-between text-[13px] font-semibold text-[#5B5A57]">
            <span>{en ? "Sample question" : "Întrebare de probă"}</span>
            <span className="text-[#204F3A]">{en ? "Try it" : "Încearcă"}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#EFEAE0]" aria-hidden="true">
            <div className={cn("h-1.5 rounded-full bg-[#204F3A] transition-all", answered ? "w-full" : "w-1/3")} />
          </div>
          <span className="font-display text-2xl font-bold sm:text-[26px]" id="yalla-sample-q">
            {en ? "How do you say “Welcome”?" : "Cum spui „Bine ai venit”?"}
          </span>
          <div role="group" aria-labelledby="yalla-sample-q" className="flex flex-col gap-3">
            {ANSWERS.map((a, i) => {
              const showRight = answered && a.correct;
              const showWrong = picked === i && !a.correct;
              return (
                <button
                  key={a.arabizi}
                  type="button"
                  disabled={answered}
                  onClick={() => setPicked(i)}
                  className={cn(
                    "flex h-[52px] items-center justify-between rounded-xl px-[18px] text-[17px] font-semibold transition-colors",
                    showRight && "border-2 border-[#204F3A] bg-[#E6EFEA]",
                    showWrong && "border-2 border-[#DC2828] bg-[#FBE9E7]",
                    !showRight && !showWrong && "border border-[#E7E1D6] bg-white",
                    !answered && "hover:border-[#204F3A]",
                  )}
                >
                  <span lang="apc-Latn">{a.arabizi}</span>
                  <span dir="rtl" lang="ar" className="font-arabic font-medium text-[#5B5A57]">
                    {a.arabic}
                  </span>
                </button>
              );
            })}
          </div>
          <p aria-live="polite" className="min-h-[1.5rem] text-sm">
            {answered && (
              <>
                <span className={cn("font-semibold", right ? "text-[#204F3A]" : "text-[#DC2828]")}>
                  {right
                    ? en ? "Correct! " : "Corect! "
                    : en ? "Not quite — it's Ahla w sahla. " : "Nu chiar — e Ahla w sahla. "}
                </span>
                <Link to="/joc" className="font-semibold text-[#204F3A] underline underline-offset-4">
                  {en ? "Keep playing →" : "Joacă mai departe →"}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default YallaGameBand;
