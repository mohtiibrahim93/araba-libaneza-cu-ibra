import { useEffect, useState } from "react";

export const BUCHAREST_TZ = "Europe/Bucharest";

export function getLocalTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || BUCHAREST_TZ;
  } catch {
    return BUCHAREST_TZ;
  }
}

export function isLocalDifferentFromBucharest(): boolean {
  const local = getLocalTz();
  if (local === BUCHAREST_TZ) return false;
  // Compare current offset; some tz aliases match Bucharest exactly.
  const now = new Date();
  const fmt = (tz: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  return fmt(local) !== fmt(BUCHAREST_TZ);
}

/**
 * Convert a Bucharest-local civil time (Y/M/D h:m) into a UTC Date instant,
 * accounting for DST. Two-pass refinement using Intl.
 */
export function bucharestCivilToUtc(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
): Date {
  let guess = Date.UTC(year, month - 1, day, hour, minute);
  for (let i = 0; i < 2; i++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: BUCHAREST_TZ,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(guess));
    const g = (t: string) => parseInt(parts.find((p) => p.type === t)!.value, 10);
    const seenH = g("hour") % 24;
    const seenMi = g("minute");
    const seenD = g("day");
    const diffMin =
      (seenH - hour) * 60 + (seenMi - minute) + (seenD - day) * 24 * 60;
    guess -= diffMin * 60_000;
  }
  return new Date(guess);
}

/**
 * For a recurring weekly Bucharest time (weekday 1=Mon..7=Sun, "HH:MM[:SS]"),
 * compute what weekday + time it falls on in the target timezone, using the
 * next occurrence to reflect current DST correctly.
 */
export function weeklyBucharestInTz(
  weekday: number, // 1..7 (Mon..Sun)
  hhmm: string,
  targetTz: string,
): { weekday: number; time: string; sameAsSource: boolean } {
  const [h, m] = hhmm.split(":").map(Number);
  const today = new Date();
  // Find the next date (in Bucharest) matching the weekday.
  const todayParts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUCHAREST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(today);
  const y = parseInt(todayParts.find((p) => p.type === "year")!.value, 10);
  const mo = parseInt(todayParts.find((p) => p.type === "month")!.value, 10);
  const d = parseInt(todayParts.find((p) => p.type === "day")!.value, 10);
  const wdShort = todayParts.find((p) => p.type === "weekday")!.value;
  const map: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const todayWd = map[wdShort] ?? 1;
  const addDays = ((weekday - todayWd) + 7) % 7;
  // Build a Date for the target Bucharest civil moment
  const utc = bucharestCivilToUtc(y, mo, d + addDays, h, m);
  // Format in target TZ
  const out = new Intl.DateTimeFormat("en-US", {
    timeZone: targetTz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(utc);
  const newWd = map[out.find((p) => p.type === "weekday")!.value] ?? weekday;
  const newH = out.find((p) => p.type === "hour")!.value.padStart(2, "0");
  const newMi = out.find((p) => p.type === "minute")!.value.padStart(2, "0");
  return {
    weekday: newWd,
    time: `${newH === "24" ? "00" : newH}:${newMi}`,
    sameAsSource: newWd === weekday && `${newH}:${newMi}` === `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
  };
}

// ---- Shared preference store ----
const STORAGE_KEY = "tz_show_local";
const listeners = new Set<() => void>();
let enabled = false;
if (typeof window !== "undefined") {
  try {
    enabled = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    /* ignore */
  }
}

export function setShowLocalTz(value: boolean) {
  enabled = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useShowLocalTz(): boolean {
  const [v, setV] = useState(enabled);
  useEffect(() => {
    const l = () => setV(enabled);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return v;
}

/** Pretty short label for a timezone (e.g. "Europe/London" -> "London"). */
export function shortTzLabel(tz: string): string {
  const seg = tz.split("/").pop() ?? tz;
  return seg.replace(/_/g, " ");
}