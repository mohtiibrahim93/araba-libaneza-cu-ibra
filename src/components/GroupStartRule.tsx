import { CalendarCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { MAX_GROUP_SIZE, minGroupSize } from "@/lib/groupSize";
import { cn } from "@/lib/utils";

/**
 * When a group starts — the owner's rule (October 2026), stated the same way
 * on every page that sells a group:
 * - the announced start date stays fixed;
 * - the group is confirmed as soon as half its places are taken;
 * - it starts earlier only if it is full and every student agrees;
 * - the decision is made 7 days before the start: below the minimum, the start
 *   moves once (about two weeks) or everyone is refunded in full — the same
 *   moment as the 7-day full-refund rule.
 */
const GroupStartRule = ({ className }: { className?: string }) => {
  const { lang } = useI18n();
  const on = MAX_GROUP_SIZE.online;
  const fz = MAX_GROUP_SIZE.fizic;
  const text =
    lang === "en"
      ? `The announced start date stays fixed. A group is confirmed as soon as half its places are taken (${minGroupSize(on)} of ${on} online, ${minGroupSize(fz)} of ${fz} in person) — it starts earlier only if it is full and everyone agrees. The decision is made 7 days before the start: if the minimum is not reached, the start moves once, by about two weeks, or you get a full refund.`
      : `Data de start anunțată rămâne fixă. Grupa e confirmată imediat ce se ocupă jumătate din locuri (${minGroupSize(on)} din ${on} online, ${minGroupSize(fz)} din ${fz} fizic) — pornește mai devreme doar dacă e completă și toți sunt de acord. Decizia se ia cu 7 zile înainte de start: dacă minimul nu e atins, startul se mută o singură dată, cu aproximativ două săptămâni, sau primești banii înapoi integral.`;
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl bg-cream px-5 py-4", className)}>
      <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold text-foreground">{lang === "en" ? "When does the group start?" : "Când pornește grupa?"}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">{text}</p>
      </div>
    </div>
  );
};

export default GroupStartRule;
