import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * A time field that is always 24-hour.
 *
 * `<input type="time">` renders in the browser's own locale, not the page's,
 * so on a machine set to English it shows "12:00 PM" in a Romanian panel for
 * a school that writes every other hour on the site as 19:00. There is no
 * attribute that forces the 24-hour clock — the only way to be sure is to
 * stop asking the browser to draw a clock at all.
 *
 * So: two selects, hour and minute. Deterministic in every locale, one tap
 * each on a phone, and nothing to mistype. The stored value keeps the same
 * "HH:MM" shape the inputs produced, so nothing downstream changes.
 *
 * Minutes step by 15. If a stored value sits off that grid it is added as its
 * own option rather than snapped, because silently rewriting 10:20 to 10:15
 * while someone edits the day beside it is the kind of edit nobody asked for.
 */
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));
const MINUTE_STEPS = ["00", "15", "30", "45"];

const pad = (n: number) => String(n).padStart(2, "0");

/** "9:5" / "09:05:00" / "" → ["09", "05"], falling back to 00:00. */
export function splitHhmm(value: string): [string, string] {
  const m = /^(\d{1,2}):(\d{1,2})/.exec(value?.trim() ?? "");
  if (!m) return ["00", "00"];
  const h = Math.min(23, Math.max(0, Number(m[1])));
  const min = Math.min(59, Math.max(0, Number(m[2])));
  return [pad(h), pad(min)];
}

export function TimeField({
  value,
  onChange,
  label,
  className,
  disabled,
}: {
  /** "HH:MM" or "HH:MM:SS". */
  value: string;
  /** Called with "HH:MM". */
  onChange: (hhmm: string) => void;
  /** Labels the pair for screen readers; the visible <Label> stays outside. */
  label: string;
  className?: string;
  disabled?: boolean;
}) {
  const [hh, mm] = splitHhmm(value);
  const id = useId();
  const minutes = MINUTE_STEPS.includes(mm) ? MINUTE_STEPS : [...MINUTE_STEPS, mm].sort();
  const select =
    "h-9 rounded-md border border-input bg-background px-2 text-sm tabular-nums disabled:opacity-60";

  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-labelledby={id}>
      <span id={id} className="sr-only">
        {label}
      </span>
      <select
        className={select}
        value={hh}
        disabled={disabled}
        aria-label={`${label} — ora`}
        onChange={(e) => onChange(`${e.target.value}:${mm}`)}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="text-muted-foreground">
        :
      </span>
      <select
        className={select}
        value={mm}
        disabled={disabled}
        aria-label={`${label} — minutul`}
        onChange={(e) => onChange(`${hh}:${e.target.value}`)}
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
