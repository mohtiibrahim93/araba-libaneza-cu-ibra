/**
 * Student accounts: keep the Yalla game's progress in step with the account.
 *
 * The game (public/yalla/) saves everything in localStorage under
 * YALLA_STORAGE_KEY and knows nothing about accounts. The site, on the same
 * origin, reads that, merges it with the row in student_progress, and writes
 * the result back to both — so a student who signs in on a second device gets
 * the same progress there.
 *
 * mergeStates follows the game's own import rules (public/yalla/transfer.js):
 * the higher XP and round count win, each item keeps its most recent answer,
 * and daily counts take the larger value. Nothing a student did is lost by
 * signing in, on either side.
 */
import { YALLA_STORAGE_KEY } from "@/lib/yallaProgress";

type ItemProgress = { last?: number; seen?: number | boolean; [k: string]: unknown };
export type GameState = {
  xp?: number;
  rounds?: number;
  progress?: Record<string, ItemProgress>;
  daily?: Record<string, number>;
  badges?: unknown[];
  placementResult?: { level?: string; title?: string; scores?: number[]; date?: string } & Record<string, unknown>;
  [k: string]: unknown;
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const seenOf = (p?: ItemProgress) => (typeof p?.seen === "number" ? p.seen : p?.seen ? 1 : 0);

export function mergeStates(local: GameState | null, remote: GameState | null): GameState {
  if (!local) return remote ?? {};
  if (!remote) return local;
  const progress: Record<string, ItemProgress> = { ...(remote.progress ?? {}) };
  for (const [id, p] of Object.entries(local.progress ?? {})) {
    const old = progress[id];
    if (!old || num(p.last) > num(old.last) || (num(p.last) === num(old.last) && seenOf(p) > seenOf(old))) {
      progress[id] = p;
    }
  }
  const daily: Record<string, number> = { ...(remote.daily ?? {}) };
  for (const [d, n] of Object.entries(local.daily ?? {})) daily[d] = Math.max(num(daily[d]), num(n));
  const badges = Array.from(new Set([...(remote.badges ?? []), ...(local.badges ?? [])].map((b) => JSON.stringify(b)))).map(
    (b) => JSON.parse(b) as unknown,
  );
  // The more recent level test wins.
  const lp = local.placementResult;
  const rp = remote.placementResult;
  const placementResult = !lp ? rp : !rp ? lp : String(lp.date ?? "") >= String(rp.date ?? "") ? lp : rp;
  return {
    ...remote,
    ...local,
    ...(local.xp !== undefined || remote.xp !== undefined ? { xp: Math.max(num(local.xp), num(remote.xp)) } : {}),
    ...(local.rounds !== undefined || remote.rounds !== undefined
      ? { rounds: Math.max(num(local.rounds), num(remote.rounds)) }
      : {}),
    progress,
    // Only fields either side had, so an unchanged state compares equal and
    // signing in does not reload the game for nothing.
    ...(local.daily || remote.daily ? { daily } : {}),
    ...(local.badges || remote.badges ? { badges } : {}),
    ...(placementResult ? { placementResult } : {}),
  };
}

/** The summary columns written next to the state, for the admin list. */
export function summarize(state: GameState) {
  const items = Object.values(state.progress ?? {});
  const lastMs = items.reduce((m, p) => Math.max(m, num(p.last)), 0);
  return {
    xp: Math.round(num(state.xp)),
    rounds: Math.round(num(state.rounds)),
    items_seen: items.filter((p) => seenOf(p) > 0).length,
    last_played_at: lastMs > 0 ? new Date(lastMs).toISOString() : null,
    placement: state.placementResult ?? null,
  };
}

export function readLocalState(): GameState | null {
  try {
    const raw = localStorage.getItem(YALLA_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

export function writeLocalState(state: GameState) {
  try {
    localStorage.setItem(YALLA_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: the account copy is still saved */
  }
}

const stable = (v: unknown): string =>
  Array.isArray(v)
    ? `[${v.map(stable).join(",")}]`
    : v && typeof v === "object"
      ? `{${Object.keys(v as object)
          .sort()
          .map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`)
          .join(",")}}`
      : JSON.stringify(v);

/** Same content, ignoring key order — decides whether the game must reload. */
export const sameState = (a: GameState | null, b: GameState | null) => stable(a ?? {}) === stable(b ?? {});
