import { useCallback, useEffect, useRef, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import ImportCalendarEvent, {
  type UnmatchedEvent,
} from "@/components/admin/ImportCalendarEvent";
type SyncResult = {
  updated: number;
  pushed: number;
  imported?: number;
  errors: string[];
  unmatched: UnmatchedEvent[];
};
export default function CalendarSyncPanel({
  from,
  to,
  onChanged,
  showExternal = true,
}: {
  from?: string;
  to?: string;
  onChanged?: (() => void) | undefined;
  showExternal?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [checked, setChecked] = useState("");
  const [importing, setImporting] = useState<string | null>(null);
  const callback = useRef(onChanged);
  callback.current = onChanged;
  const active = useRef(false);
  const generation = useRef(0);
  const latestSync = useRef<(() => Promise<void>) | null>(null);
  const mounted = useRef(true);
  const sync = useCallback(async () => {
    if (active.current) return;
    const version = generation.current;
    active.current = true;
    setBusy(true);
    setError("");
    try {
      const { data, error: failure } = await invokeAdmin({
        action: "sync_calendar",
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      });
      if (
        failure ||
        data?.error ||
        !data?.data ||
        !Array.isArray(data.data.errors)
      )
        throw new Error(
          data?.error ||
            failure?.message ||
            "Sincronizarea nu a putut fi verificată.",
        );
      if (!mounted.current || version !== generation.current) return;
      setResult(data.data);
      setChecked(
        new Date().toLocaleTimeString("ro-RO", {
          timeZone: "Europe/Bucharest",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      callback.current?.();
    } catch (failure) {
      if (mounted.current && version === generation.current)
        setError(
          failure instanceof Error ? failure.message : "Sincronizare eșuată.",
        );
    } finally {
      active.current = false;
      if (mounted.current) {
        setBusy(false);
        if (version !== generation.current) void latestSync.current?.();
      }
    }
  }, [from, to]);
  latestSync.current = sync;
  useEffect(() => {
    generation.current++;
    mounted.current = true;
    setResult(null);
    setChecked("");
    setError("");
    void sync();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void sync();
    }, 60000);
    return () => {
      mounted.current = false;
      window.clearInterval(timer);
    };
  }, [sync]);
  const fmt = (value: string) =>
    new Date(value).toLocaleString("ro-RO", {
      timeZone: "Europe/Bucharest",
      dateStyle: "short",
      timeStyle: "short",
    });
  return (
    <section className="rounded-xl border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">
          Google Calendar · ora României
          {checked ? ` · verificat la ${checked}` : ""}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => void sync()}
          className="rounded border px-3 py-2 text-sm"
        >
          {busy ? "Se sincronizează…" : "Sincronizează Google Calendar"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {result?.errors.length ? (
        <div role="alert" className="text-sm text-destructive">
          <p>
            {result.errors.length} probleme de sincronizare rămân deschise.
            Reîncearcă sau verifică evenimentele.
          </p>
          <ul>
            {result.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : (
        result &&
        !error && (
          <p role="status" className="text-xs text-muted-foreground">
            Sincronizat: {result.updated} modificări Google preluate,{" "}
            {result.pushed} actualizări admin trimise
            {result.imported
              ? `, ${result.imported} lecții noi preluate din Google`
              : ""}
            .
          </p>
        )
      )}
      {showExternal && !!result?.unmatched.length && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Evenimente Google fără cursant sau grupă asociată
          </p>
          <p className="text-xs text-muted-foreground">
            Sunt afișate din calendar; nu sunt înscrieri și nu confirmă plata.
          </p>
          {result.unmatched.map((event) => (
            <div
              key={event.id}
              className="rounded border border-dashed p-2 text-sm"
            >
              <span className="font-semibold">{event.summary}</span>
              <p>
                {fmt(event.start_at)} – {fmt(event.end_at)}
                {event.guest_email ? ` · ${event.guest_email}` : ""}
              </p>
              {importing === event.id ? (
                <ImportCalendarEvent
                  event={event}
                  onCancel={() => setImporting(null)}
                  onDone={() => {
                    setImporting(null);
                    void sync();
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="mt-1 rounded border px-2 py-1 text-xs"
                  onClick={() => setImporting(event.id)}
                >
                  Importă ca lecție privată
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
