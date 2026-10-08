import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, MapPin, RefreshCw, Video } from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";
import { ErrorNote } from "./ui";

/**
 * Program › Săptămâna (October 2026 redesign): the booked lessons laid out on
 * the week, so a free afternoon or a crowded Thursday shows at a glance. Same
 * data as "Toate lecțiile" (list_bookings), read-only; cancelling and the rest
 * stay there. Group classes are not bookings, so they are not drawn here.
 */
interface Booking {
  id: string;
  event_type_slug: string;
  start_at: string;
  end_at: string;
  student_name: string;
  format: string;
  status: string;
  meet_link: string | null;
  google_sync_error: string | null;
  google_event_id: string | null;
}

const TZ = "Europe/Bucharest";
const HOUR_PX = 52;
const DAY_NAMES = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

/** Local (Bucharest) parts of an instant. */
const parts = (d: Date) => {
  const p: Record<string, string> = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(p["weekday"] ?? "");
  return {
    key: `${p["year"]}-${p["month"]}-${p["day"]}`,
    hour: Number(p["hour"]),
    minute: Number(p["minute"]),
    weekday,
  };
};

/** Calendar date keys (YYYY-MM-DD) of the Monday–Sunday week `offset` weeks from now. */
const weekKeys = (offset: number) => {
  const now = new Date();
  const { weekday, key } = parts(now);
  // Step from noon UTC on today's local date, so every step lands on the
  // right calendar day whatever the offset or a DST change.
  const [y = 1970, m = 1, d = 1] = key.split("-").map(Number);
  const localNoon = Date.UTC(y, m - 1, d, 12);
  return Array.from({ length: 7 }, (_, i) =>
    new Date(localNoon + ((i - weekday) + offset * 7) * 86_400_000).toISOString().slice(0, 10),
  );
};

const label = (slug: string) =>
  slug === "trial" ? "probă" : slug === "verificare-nivel" ? "verificare nivel" : slug === "paid" ? "privat" : slug;
const isFree = (slug: string) => slug === "trial" || slug === "verificare-nivel";
const time = (iso: string) => {
  const p = parts(new Date(iso));
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
};
// Same test as Acasă and Sănătate calendar: no event means not in the calendar,
// whether or not an error was recorded.
const notInCalendar = (b: Booking) => b.status === "confirmed" && !b.google_event_id;

const WeekLessons = () => {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await invokeAdmin({ action: "list_bookings", status_filter: "all" });
      if (err) throw err;
      if (data?.error) throw new Error(data.error);
      setRows((data.data ?? []) as Booking[]);
    } catch {
      setError("Nu am putut încărca lecțiile.");
      setRows((r) => r ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo(() => weekKeys(offset), [offset]);
  const today = parts(new Date()).key;

  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>(days.map((d) => [d, []]));
    for (const b of rows ?? []) {
      if (b.status === "cancelled") continue;
      const k = parts(new Date(b.start_at)).key;
      map.get(k)?.push(b);
    }
    for (const list of map.values()) list.sort((a, b) => a.start_at.localeCompare(b.start_at));
    return map;
  }, [rows, days]);

  const all = [...byDay.values()].flat();
  const startHour = Math.min(9, ...all.map((b) => parts(new Date(b.start_at)).hour));
  const endHour = Math.max(20, ...all.map((b) => parts(new Date(b.end_at)).hour + 1));
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  const dayNum = (k: string) => Number(k.slice(8));
  const monthName = (k: string) =>
    new Date(`${k}T12:00:00Z`).toLocaleDateString("ro-RO", { month: "long", timeZone: "UTC" });
  const first = days[0] ?? "";
  const last = days[6] ?? "";
  const range = `${dayNum(first)} ${monthName(first) !== monthName(last) ? monthName(first) + " " : ""}– ${dayNum(last)} ${monthName(last)}`;
  const free = all.filter((b) => isFree(b.event_type_slug)).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-label="Săptămâna trecută"
          onClick={() => setOffset((o) => o - 1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setOffset(0)}
          className="h-11 rounded-xl border border-border bg-card px-4 font-semibold hover:bg-muted"
        >
          Azi
        </button>
        <button
          type="button"
          aria-label="Săptămâna viitoare"
          onClick={() => setOffset((o) => o + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="ml-1 font-bold">{range}</span>
        <span className="text-sm text-muted-foreground">
          · {all.length} {all.length === 1 ? "lecție" : "lecții"}
          {free ? `, ${free} gratuite` : ""}
        </span>
        <button
          type="button"
          aria-label="Reîncarcă"
          onClick={() => void load()}
          disabled={loading}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      {!rows && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă…
        </p>
      )}

      {rows && (
        <>
          {/* Phone: the week as a list, day by day. */}
          <div className="space-y-4 sm:hidden">
            {days.map((k, i) => {
              const list = byDay.get(k) ?? [];
              return (
                <section key={k} className="space-y-2">
                  <h3
                    className={cn(
                      "text-xs font-bold uppercase tracking-[0.12em]",
                      k === today ? "text-brand-green dark:text-primary" : "text-muted-foreground",
                    )}
                  >
                    {DAY_NAMES[i]} {dayNum(k)}
                    {k === today ? " · azi" : ""}
                  </h3>
                  {list.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nicio lecție.</p>
                  ) : (
                    list.map((b) => <AgendaRow key={b.id} b={b} />)
                  )}
                </section>
              );
            })}
          </div>

          {/* Computer and tablet: the week as a grid. */}
          <section className="hidden overflow-x-auto rounded-2xl border border-border bg-card p-4 sm:block">
            <div className="grid min-w-[720px] grid-cols-[52px_repeat(7,minmax(0,1fr))] gap-x-1.5">
              <span />
              {days.map((k, i) => (
                <span
                  key={k}
                  className={cn(
                    "mb-2 flex flex-col items-center justify-center rounded-xl py-1.5 text-[0.8125rem]",
                    k === today ? "bg-accent font-bold text-brand-green dark:text-primary" : "text-muted-foreground",
                  )}
                >
                  {DAY_NAMES[i]}
                  <b className={cn("text-base", k !== today && "text-foreground")}>{dayNum(k)}</b>
                </span>
              ))}

              <div className="relative" style={{ height: hours.length * HOUR_PX }}>
                {hours.map((h, i) => (
                  <span key={h} className="absolute text-xs text-muted-foreground" style={{ top: i * HOUR_PX }}>
                    {String(h).padStart(2, "0")}:00
                  </span>
                ))}
              </div>
              {days.map((k, di) => (
                <div
                  key={k}
                  className="relative border-t border-border/70"
                  style={{
                    height: hours.length * HOUR_PX,
                    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_PX - 1}px, hsl(var(--border) / 0.7) ${HOUR_PX - 1}px, hsl(var(--border) / 0.7) ${HOUR_PX}px)`,
                  }}
                >
                  {/* The level-check hour, weekdays 12–13 (schedule-rules.ts). */}
                  {di < 5 && (
                    <div
                      aria-hidden
                      className="absolute inset-x-0 rounded-lg border border-dashed border-border bg-muted/60"
                      style={{ top: (12 - startHour) * HOUR_PX + 2, height: HOUR_PX - 4 }}
                    />
                  )}
                  {(byDay.get(k) ?? []).map((b) => {
                    const s = parts(new Date(b.start_at));
                    const e = parts(new Date(b.end_at));
                    const top = (s.hour - startHour + s.minute / 60) * HOUR_PX;
                    // At least 50 minutes tall, so a 30-minute trial is still readable.
                    const mins = Math.max(50, (e.hour - s.hour) * 60 + (e.minute - s.minute));
                    const warn = notInCalendar(b);
                    return (
                      <a
                        key={b.id}
                        href={b.meet_link ?? undefined}
                        target={b.meet_link ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        title={`${time(b.start_at)} ${b.student_name} · ${label(b.event_type_slug)}`}
                        className={cn(
                          "absolute inset-x-0 flex flex-col overflow-hidden rounded-[10px] px-2 py-1 text-[0.8125rem] leading-tight",
                          warn
                            ? "border border-dashed border-amber-600 bg-admin-warn-bg text-admin-warn-fg"
                            : isFree(b.event_type_slug)
                              ? "border border-brand-green bg-accent text-brand-green dark:border-primary dark:text-primary"
                              : "bg-brand-green text-white",
                        )}
                        style={{ top: top + 2, height: (mins / 60) * HOUR_PX - 4 }}
                      >
                        <b className="truncate">
                          {time(b.start_at)} {b.student_name.split(" ")[0]}
                        </b>
                        <span className="truncate opacity-90">{warn ? "lipsă din calendar" : label(b.event_type_slug)}</span>
                      </a>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 px-1 pt-3 text-[0.8125rem] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-brand-green" /> Lecție plătită
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-brand-green bg-accent" /> Probă / verificare nivel (gratuit)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-dashed border-amber-600 bg-admin-warn-bg" /> Nu e în Google Calendar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border border-dashed border-border bg-muted" /> 12–13: ora pentru verificări de nivel
              </span>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const AgendaRow = ({ b }: { b: Booking }) => {
  const warn = notInCalendar(b);
  return (
    <div className="flex gap-3">
      <span className="w-12 shrink-0 pt-3.5 font-bold tabular-nums">{time(b.start_at)}</span>
      <div
        className={cn(
          "flex flex-1 items-center gap-3 rounded-2xl border p-3.5",
          warn
            ? "border-dashed border-amber-600 bg-admin-warn-bg"
            : isFree(b.event_type_slug)
              ? "border-brand-green bg-accent dark:border-primary"
              : "border-border bg-card",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{b.student_name}</p>
          <p className={cn("flex items-center gap-1 text-[0.8125rem]", warn ? "text-admin-warn-fg" : "text-muted-foreground")}>
            {b.format === "online" ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {label(b.event_type_slug)} · {b.format === "online" ? "online" : "la centru"}
            {warn ? " · lipsă din calendar" : ""}
          </p>
        </div>
        {b.meet_link && (
          <a
            href={b.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center rounded-xl bg-brand-green px-4 font-semibold text-white"
          >
            Intră
          </a>
        )}
      </div>
    </div>
  );
};

export default WeekLessons;
