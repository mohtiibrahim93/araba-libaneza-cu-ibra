/**
 * The CEFR levels whose group courses are open for sign-up. Was copied in five
 * places (audit P2); change it here when a new level opens.
 */
export const OPEN_LEVELS: readonly string[] = ["A1", "A2"];

export const isOpenLevel = (level: string | null | undefined): boolean =>
  !!level && OPEN_LEVELS.includes(level.toUpperCase());
