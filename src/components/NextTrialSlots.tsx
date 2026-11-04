import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Link } from "@/components/LocalizedLink";

const TZ = "Europe/Bucharest";
const ymd = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });

/**
 * The next free online trial times, from the same availability service the
 * booking page uses. Renders nothing until real times arrive (or on error).
 */
const NextTrialSlots = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    const now = new Date();
    const to = new Date(now.getTime() + 14 * 864e5);
    const url =
      `${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/booking-availability` +
      `?event_type=trial&date_from=${ymd(now)}&date_to=${ymd(to)}&format=online`;
    let alive = true;
    fetch(url, { headers: { apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && Array.isArray(j?.slots))
          setSlots([...j.slots].sort().slice(0, 3));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (slots.length === 0) return null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(en ? "en-GB" : "ro-RO", {
      timeZone: TZ,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-2">
        {en ? "Next free trial times (online)" : "Următoarele ore libere pentru proba online"}
      </p>
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => (
          <Link
            key={s}
            to="/trial"
            className="rounded-lg border border-primary/30 bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
          >
            {fmt(s)}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NextTrialSlots;
