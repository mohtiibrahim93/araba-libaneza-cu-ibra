import { useI18n } from "@/lib/i18n";
import { useActiveCohorts } from "@/hooks/useActiveCohorts";
import { cohortNoteLines } from "@/lib/cohortCopy";

/**
 * "Which groups are open, and when do they start" — read from the database
 * rather than typed into the copy.
 *
 * Three places said it in prose, and all three were three weeks out of date:
 * a visitor on 21 September was told the A1 and A2 groups start on 1 and 2
 * September. The dates live in group_cohorts, the owner keeps them current in
 * the admin, and useActiveCohorts already selects exactly the right ones —
 * running for up to three weeks, or starting within two months.
 *
 * While the query is in flight, and when nothing is scheduled, this falls back
 * to an evergreen sentence. That matters more than it looks: the server render
 * has no database result, so the fallback is what a crawler and a
 * first-paint visitor see. An honest "groups start regularly, ask us" beats a
 * date that may already have passed.
 */
const CohortEnrollmentNote = ({ className = "" }: { className?: string }) => {
  const { t, lang } = useI18n();
  const { cohorts, loading } = useActiveCohorts();

  const lines = loading
    ? []
    : cohortNoteLines(
        cohorts,
        {
          runningSince: t.cohortNoteRunningSince,
          startsOn: t.cohortNoteStartsOn,
          today: t.activeNowToday,
          full: t.activeNowFull,
          online: t.spotsOnline,
          inPerson: t.spotsFizic,
          spotsLeft: t.capSpotsLeft,
          taughtRo: t.cohortNoteTaughtRo,
          taughtEn: t.cohortNoteTaughtEn,
          seatsOf: t.cohortNoteSeatsOf,
        },
        lang,
      );

  return (
    <p className={`whitespace-pre-line ${className}`}>
      {lines.length ? lines.join("\n") : t.cohortNoteFallback}
    </p>
  );
};

export default CohortEnrollmentNote;
