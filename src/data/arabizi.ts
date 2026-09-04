/**
 * The arabizi digit table — the single source for every place the site states
 * which digits stand in for which Arabic letters.
 *
 * It used to exist as five separate copies: /arabizi, the blog article, the two
 * language variants of the blog seed body, and the cheat-sheet PDF. When 9 (ق)
 * was dropped, three of the five were updated; when 6 (ط) was dropped, the PDF
 * still taught both for weeks — and the PDF is the file people receive by
 * email, so it was the copy contradicting the site to the people most likely
 * to trust it.
 *
 * Everything now reads this array. Change a row here and the landing page, the
 * blog article, the seeded markdown and the PDF all follow. A test asserts the
 * PDF on disk was rebuilt after any change.
 *
 * Lebanese arabizi uses 2, 3, 5, 7 and 8. It does not use 6 for ط or 9 for ق —
 * those belong to other transliteration conventions and are not taught here.
 */
export interface ArabiziDigit {
  digit: string;
  /** Arabic letter(s) the digit stands for. */
  letter: string;
  /** Short definition, used in every compact table. */
  sound: { ro: string; en: string };
  /** Extra nuance shown only on /arabizi, where there is room for it. */
  note?: { ro: string; en: string };
  examples: { ro: string; en: string };
}

export const ARABIZI_DIGITS: ArabiziDigit[] = [
  {
    digit: "2",
    letter: "ء / ق",
    sound: {
      ro: "oprire glotală, ca pauza din „co-operare”",
      en: "glottal stop, like the pause in 'co-operate'",
    },
    note: {
      ro: "în libaneză și ق se pronunță așa",
      en: "in Lebanese, ق is pronounced this way too",
    },
    examples: {
      ro: "2ana (eu), 2aleb (inimă), 2amar (lună)",
      en: "2ana (I), 2aleb (heart), 2amar (moon)",
    },
  },
  {
    digit: "3",
    letter: "ع",
    sound: {
      ro: "sunet gutural adânc din gât, specific arab",
      en: "deep guttural sound from the throat, specific to Arabic",
    },
    examples: { ro: "3afwan, ya3ni, 3anjad", en: "3afwan, ya3ni, 3anjad" },
  },
  {
    digit: "5",
    letter: "خ",
    sound: {
      ro: "h aspru, ca „ch” în germană „Bach”",
      en: "harsh h, like 'ch' in German 'Bach'",
    },
    examples: { ro: "5alas, 5ayye (frate)", en: "5alas, 5ayye (brother)" },
  },
  {
    digit: "7",
    letter: "ح",
    sound: {
      ro: "h puternic din gât, fără echivalent în română",
      en: "strong h from the throat, no English equivalent",
    },
    examples: { ro: "mar7aba, 7abibi", en: "mar7aba, 7abibi" },
  },
  {
    digit: "8",
    letter: "غ",
    sound: {
      ro: "gh, ca un „r” franțuzesc răgușit",
      en: "gh, like a raspy French 'r'",
    },
    examples: { ro: "8ada (prânz), 8ali (scump)", en: "8ada (lunch), 8ali (expensive)" },
  },
];

/** e.g. "2, 3, 5, 7 și 8" — so prose can never list a digit the table lacks. */
export function arabiziDigitList(lang: "ro" | "en" = "ro"): string {
  const d = ARABIZI_DIGITS.map((x) => x.digit);
  const last = d[d.length - 1];
  return `${d.slice(0, -1).join(", ")} ${lang === "en" ? "and" : "și"} ${last}`;
}

/** The markdown table used inside the seeded blog bodies. */
export function arabiziMarkdownTable(lang: "ro" | "en"): string {
  const head =
    lang === "en"
      ? "| Number | Arabic letter | Sound |\n| --- | --- | --- |"
      : "| Cifră | Literă arabă | Sunet |\n| --- | --- | --- |";
  const rows = ARABIZI_DIGITS.map(
    (d) => `| ${d.digit} | ${d.letter} | ${d.sound[lang]} |`,
  );
  return [head, ...rows].join("\n");
}
