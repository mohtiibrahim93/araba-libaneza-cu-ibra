import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import AvailabilityAdmin from "@/components/AvailabilityAdmin";

/**
 * Program › Disponibilitate (owner's request, 13 October 2026): everything
 * that decides which hours the site offers, in one place and all editable.
 *  - Ce vede vizitatorul: the real free hours, from the same endpoint the
 *    booking form uses, so what is shown here is exactly what a visitor sees.
 *  - Weekly hours (AvailabilityAdmin), general or for one lesson type.
 *  - Each lesson type's limits: notice, how far ahead, gaps, in-person days.
 *  - Days off: dates with nothing offered.
 */

interface EventType {
  slug: string;
  name_ro: string;
  duration_min: number;
  buffer_before_min: number;
  buffer_after_min: number;
  min_notice_hours: number | null;
  max_advance_days: number | null;
  physical_weekdays: number[] | null;
  is_active: boolean;
}
interface Blackout {
  id: string;
  start_date: string;
  end_date: string;
  note: string | null;
}

const DAYS = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const TZ = "Europe/Bucharest";
const card = "rounded-lg border border-border bg-card p-4";
const input = "h-9 rounded-md border border-input bg-background px-2 text-sm";

const todayKey = (offsetDays = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(
    new Date(Date.now() + offsetDays * 86_400_000),
  );
const dayLabel = (key: string) =>
  new Intl.DateTimeFormat("ro-RO", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${key}T12:00:00Z`));
const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("ro-RO", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

function Preview({ types }: { types: EventType[] }) {
  const [slug, setSlug] = useState("trial");
  const [format, setFormat] = useState<"online" | "physical">("online");
  const [slots, setSlots] = useState<Record<string, string[]> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        `${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/booking-availability` +
        `?event_type=${encodeURIComponent(slug)}&date_from=${todayKey()}&date_to=${todayKey(13)}&format=${format}`;
      const res = await fetch(url, {
        headers: { apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Nu am putut citi orele.");
      setSlots(json.slots_by_date ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nu am putut citi orele.");
    } finally {
      setLoading(false);
    }
  }, [slug, format]);

  useEffect(() => {
    void load();
  }, [load]);

  const days = Array.from({ length: 14 }, (_, i) => todayKey(i));
  return (
    <section className={card}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Ce vede vizitatorul
          </h2>
          <p className="text-sm text-muted-foreground">
            Orele libere oferite acum pe site, în următoarele 14 zile, după
            calendar, lecții, grupe și zilele libere.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Tipul lecției"
            className={input}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          >
            {types
              .filter((t) => t.is_active)
              .map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name_ro}
                </option>
              ))}
          </select>
          <select
            aria-label="Format"
            className={input}
            value={format}
            onChange={(e) => setFormat(e.target.value as "online" | "physical")}
          >
            <option value="online">Online</option>
            <option value="physical">La centru</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="h-9 rounded-md border px-3 text-sm"
          >
            {loading ? "Se încarcă…" : "Reîmprospătează"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {slots && (
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {days.map((d) => (
            <li
              key={d}
              className="flex gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="w-24 shrink-0 font-semibold">{dayLabel(d)}</span>
              <span
                className={
                  (slots[d] ?? []).length
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {(slots[d] ?? []).length
                  ? (slots[d] ?? []).map(hhmm).join(", ")
                  : "nimic"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TypeRules({
  type,
  onSaved,
}: {
  type: EventType;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    min_notice_hours: type.min_notice_hours ?? 0,
    max_advance_days: type.max_advance_days ?? 30,
    buffer_before_min: type.buffer_before_min,
    buffer_after_min: type.buffer_after_min,
    anyDay: type.physical_weekdays === null,
    days: type.physical_weekdays ?? [0, 1, 2, 3, 4, 5, 6],
  });
  const [status, setStatus] = useState("");
  const num = (
    k:
      | "min_notice_hours"
      | "max_advance_days"
      | "buffer_before_min"
      | "buffer_after_min",
    label: string,
    unit: string,
  ) => (
    <label className="flex flex-col gap-1 text-xs">
      {label}
      <span className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          className={`${input} w-20`}
          value={form[k]}
          onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
        />
        <span className="text-muted-foreground">{unit}</span>
      </span>
    </label>
  );
  const save = async () => {
    setStatus("Se salvează…");
    const { data, error } = await invokeAdmin<{
      success?: boolean;
      error?: string;
    }>({
      action: "update_event_type_rules",
      slug: type.slug,
      min_notice_hours: form.min_notice_hours,
      max_advance_days: form.max_advance_days,
      buffer_before_min: form.buffer_before_min,
      buffer_after_min: form.buffer_after_min,
      physical_weekdays: form.anyDay ? null : form.days,
    });
    if (error || data?.error || data?.success !== true)
      setStatus(data?.error || error?.message || "Nu s-a salvat.");
    else {
      setStatus("Salvat.");
      onSaved();
    }
  };
  return (
    <div className="space-y-3 rounded-md border border-border bg-background p-3">
      <p className="font-semibold">
        {type.name_ro}{" "}
        <span className="font-normal text-muted-foreground">
          · {type.duration_min} min
        </span>
      </p>
      <div className="flex flex-wrap gap-4">
        {num("min_notice_hours", "Rezervare cu cel puțin", "ore înainte")}
        {num("max_advance_days", "Cel mult cu", "zile înainte")}
        {num("buffer_before_min", "Pauză înainte", "min")}
        {num("buffer_after_min", "Pauză după", "min")}
      </div>
      <fieldset className="space-y-1.5 text-sm">
        <legend className="text-xs">La centru, se poate rezerva:</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.anyDay}
            onChange={(e) => setForm({ ...form, anyDay: e.target.checked })}
          />
          În orice zi cu ore disponibile
        </label>
        {!form.anyDay && (
          <div className="flex flex-wrap gap-2">
            {ORDER.map((d) => (
              <label key={d} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={form.days.includes(d)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      days: e.target.checked
                        ? [...form.days, d]
                        : form.days.filter((x) => x !== d),
                    })
                  }
                />
                {DAYS[d]}
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
        >
          Salvează
        </button>
        {status && (
          <span role="status" className="text-xs text-muted-foreground">
            {status}
          </span>
        )}
      </div>
    </div>
  );
}

function DaysOff({
  blackouts,
  onChanged,
}: {
  blackouts: Blackout[];
  onChanged: () => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const add = async () => {
    setError("");
    const { data, error: failure } = await invokeAdmin<{
      success?: boolean;
      error?: string;
    }>({
      action: "add_blackout",
      start_date: start,
      end_date: end || start,
      note,
    });
    if (failure || data?.error || data?.success !== true)
      return setError(data?.error || failure?.message || "Nu s-a salvat.");
    setStart("");
    setEnd("");
    setNote("");
    onChanged();
  };
  const remove = async (id: string) => {
    const { data, error: failure } = await invokeAdmin<{
      success?: boolean;
      error?: string;
    }>({ action: "delete_blackout", id });
    if (failure || data?.error)
      return setError(data?.error || failure?.message || "Nu s-a șters.");
    onChanged();
  };
  const fmt = (d: string) =>
    new Intl.DateTimeFormat("ro-RO", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${d}T00:00:00Z`));
  return (
    <section className={card}>
      <h2 className="text-base font-semibold text-foreground">Zile libere</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        În aceste zile site-ul nu oferă nicio oră. Lecțiile deja rezervate
        rămân; din admin poți programa în continuare.
      </p>
      <ul className="mb-3 space-y-1.5">
        {blackouts.length === 0 && (
          <li className="text-sm text-muted-foreground">
            Nicio zi liberă programată.
          </li>
        )}
        {blackouts.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <span className="font-semibold">
              {b.start_date === b.end_date
                ? fmt(b.start_date)
                : `${fmt(b.start_date)} – ${fmt(b.end_date)}`}
            </span>
            {b.note && (
              <span className="text-muted-foreground">· {b.note}</span>
            )}
            <button
              type="button"
              onClick={() => void remove(b.id)}
              className="ml-auto rounded border px-2 py-1 text-xs"
            >
              Șterge
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs">
          De la
          <input
            type="date"
            className={input}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Până la (inclusiv)
          <input
            type="date"
            className={input}
            value={end}
            min={start}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Notă (opțional)
          <input
            className={input}
            value={note}
            maxLength={200}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ex. concediu"
          />
        </label>
        <button
          type="button"
          disabled={!start}
          onClick={() => void add()}
          className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Adaugă
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}

export default function BookingSettingsAdmin() {
  const [types, setTypes] = useState<EventType[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    const { data, error: failure } = await invokeAdmin<{
      data?: { event_types: EventType[]; blackouts: Blackout[] };
      error?: string;
    }>({ action: "list_booking_settings" });
    if (failure || data?.error || !data?.data)
      return setError(
        data?.error || failure?.message || "Nu am putut încărca setările.",
      );
    setError("");
    setTypes(data.data.event_types);
    setBlackouts(data.data.blackouts);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {types.length > 0 && <Preview key={`p${version}`} types={types} />}
      <AvailabilityAdmin
        eventTypes={types.map((t) => ({ slug: t.slug, name_ro: t.name_ro }))}
      />
      <section className={card}>
        <h2 className="text-base font-semibold text-foreground">
          Reguli pe tip de lecție
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Cu cât timp înainte se poate rezerva, cât de departe, pauzele dintre
          lecții și zilele pentru lecțiile la centru.
        </p>
        <div className="space-y-3">
          {types.map((t) => (
            <TypeRules
              key={`${t.slug}-${version}`}
              type={t}
              onSaved={() => void load()}
            />
          ))}
        </div>
      </section>
      <DaysOff blackouts={blackouts} onChanged={() => void load()} />
    </div>
  );
}
