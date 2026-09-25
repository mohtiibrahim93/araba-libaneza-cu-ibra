import type { ReactNode } from "react";

/**
 * The answer to the page's question, in the first screen.
 *
 * An assistant asked "how do I learn Lebanese Arabic" or "what does an Arabic
 * tutor cost in Bucharest" quotes a short, self-contained passage — it does not
 * assemble one out of a page's sections. A guide that only *builds* to its
 * answer over eight headings gets read, then paraphrased from someone else's
 * page that said it plainly.
 *
 * So the answer goes first, in three or four sentences that hold every fact the
 * quote needs: who teaches, where, which levels, what it costs. The page below
 * still makes the full case — this is the summary, not a replacement for it.
 *
 * Prices come from src/lib/pricing.ts wherever they appear here, so the passage
 * that gets quoted cannot end up naming last term's fee.
 */
const DirectAnswer = ({ question, children }: { question: string; children: ReactNode }) => (
  <aside
    aria-label={question}
    className="not-prose mb-10 rounded-2xl border border-border bg-muted/40 px-5 py-4"
  >
    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
      {question}
    </p>
    <div className="text-[0.975rem] leading-relaxed text-foreground [&>p+p]:mt-2">{children}</div>
  </aside>
);

export default DirectAnswer;
