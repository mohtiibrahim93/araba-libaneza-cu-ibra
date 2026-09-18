/**
 * Citirea progresului Jocului Yalla pentru pagina /joc/scor.
 *
 * Jocul (public/yalla/) salvează totul în localStorage sub cheia
 * YALLA_STORAGE_KEY, pe aceeași origine, deci pagina poate citi direct ce a
 * strâns vizitatorul — fără cont și fără server. Funcțiile de mai jos sunt
 * pure: logica e testată fără browser, iar componenta doar le hrănește cu
 * localStorage după montare.
 */
import { CARD_GROUP, GROUP_TOTALS, type YallaGroup } from "@/data/yallaLevelMap";

export const YALLA_STORAGE_KEY = "yalla-liban-progress-v1";

/** Forma salvată de joc (public/yalla/app.js); restul câmpurilor nu ne trebuie. */
export interface YallaSavedState {
  xp: number;
  rounds: number;
  /** cardId → { streak, seen, ... } — „consolidat" înseamnă streak >= 3. */
  progress: Record<string, { streak?: number; seen?: boolean }>;
  placementResult?: { level?: string; title?: string; scores?: number[]; date?: string };
}

export interface YallaSummary {
  xp: number;
  rang: number;
  rounds: number;
  practiced: number;
  mastered: number;
  masteredByGroup: Record<YallaGroup, number>;
  placementLevel: "A1" | "A2" | "B1" | null;
  placementTitle: string | null;
}

export type SuggestedLevel = "A1" | "A2" | "B1";

export interface LevelSuggestion {
  level: SuggestedLevel;
  /** Din testul de orientare din joc, sau estimată din exersare. */
  source: "placement" | "practice";
  /** Fraza afișată sub nivel, în română. */
  detail: string;
}

/** Parse sigur: întoarce null la progres lipsă, corupt sau de formă străină. */
export function parseYallaState(raw: string | null): YallaSavedState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (s && typeof s.xp === "number" && s.progress && typeof s.progress === "object") return s;
  } catch {
    /* corupt */
  }
  return null;
}

export function readYallaProgress(storage: Pick<Storage, "getItem">): YallaSavedState | null {
  return parseYallaState(storage.getItem(YALLA_STORAGE_KEY));
}

/** Aceleași cifre ca în „Pașaportul meu" al jocului, plus distribuția pe niveluri. */
export function summarizeYalla(state: YallaSavedState): YallaSummary {
  const entries = Object.values(state.progress);
  const masteredByGroup: Record<YallaGroup, number> = { A1: 0, A2: 0, Vocabular: 0 };
  for (const [cardId, p] of Object.entries(state.progress)) {
    if ((p.streak ?? 0) >= 3) {
      const g = CARD_GROUP[cardId];
      if (g) masteredByGroup[g] += 1;
    }
  }
  const pl = state.placementResult?.level;
  return {
    xp: state.xp,
    rang: Math.floor(state.xp / 200) + 1,
    rounds: typeof state.rounds === "number" ? state.rounds : 0,
    practiced: entries.filter((p) => p.seen).length,
    mastered: entries.filter((p) => (p.streak ?? 0) >= 3).length,
    masteredByGroup,
    placementLevel: pl === "A1" || pl === "A2" || pl === "B1" ? pl : null,
    placementTitle: typeof state.placementResult?.title === "string" ? state.placementResult.title : null,
  };
}

/**
 * Sugestia de nivel. Rezultatul testului de orientare din joc e cel mai bun
 * semnal; fără el, estimăm din câte carduri a consolidat vizitatorul pe
 * fiecare nivel (un card e consolidat după 3 răspunsuri corecte consecutive).
 * Banca nu are încă lecții B1, deci B1 iese doar când A1 și A2 sunt stăpânite
 * temeinic — și chiar atunci rămâne o discuție de plasare, nu o încadrare.
 */
export function suggestLevel(summary: YallaSummary): LevelSuggestion {
  if (summary.placementLevel) {
    return {
      level: summary.placementLevel,
      source: "placement",
      detail:
        summary.placementTitle ??
        `Rezultatul testului de orientare din joc: nivel ${summary.placementLevel}.`,
    };
  }

  const a1 = summary.masteredByGroup.A1;
  const a2 = summary.masteredByGroup.A2;
  const a1Share = a1 / GROUP_TOTALS.A1;
  const a2Share = a2 / GROUP_TOTALS.A2;

  if (a1 < 40) {
    return {
      level: "A1",
      source: "practice",
      detail:
        "Ești la început de drum — ai consolidat primele expresii. Cursul de A1 pornește exact de aici, cu structură și conversație.",
    };
  }
  if (a1Share >= 0.7 && a2Share >= 0.5) {
    return {
      level: "B1",
      source: "practice",
      detail:
        "Stăpânești temeinic materialul A1 și A2 din joc. Nivelul B1 se confirmă într-o discuție de plasare cu Ibrahim — jocul nu măsoară vorbirea.",
    };
  }
  if (a1Share >= 0.5) {
    return {
      level: "A2",
      source: "practice",
      detail:
        "Ai consolidat o bună parte din materialul A1. La A2 construiești mai departe: trecut, opinii și conversații mai lungi.",
    };
  }
  return {
    level: "A1",
    source: "practice",
    detail:
      "Ai o bază A1 în lucru. Cursul de grup A1 o transformă în conversație reală, cu corectare pe loc.",
  };
}
