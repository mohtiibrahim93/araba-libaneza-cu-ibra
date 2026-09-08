import { useCallback, useEffect, useState } from "react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface Probe {
  ok: boolean;
  status: number | null;
  detail: string | null;
}

interface Health {
  keys: { lovable: boolean; googleCalendar: boolean };
  read: Probe;
  write: Probe | null;
  bookings: {
    total: number;
    synced: number;
    failed: number;
    unsynced: Array<{
      id: string;
      start_at: string;
      student_name: string;
      error: string | null;
    }>;
  };
  feed: { configured: boolean; url: string | null };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
    dateStyle: "medium",
    timeStyle: "short",
  });

const Row = ({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail?: string | null;
}) => (
  <li className="flex items-start gap-2 text-sm">
    {ok ? (
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
    ) : (
      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
    )}
    <span className="min-w-0">
      <span className="text-foreground">{label}</span>
      {detail ? (
        <span className="mt-0.5 block break-words font-mono text-xs text-muted-foreground">
          {detail}
        </span>
      ) : null}
    </span>
  </li>
);

/**
 * "Does the calendar work?" answered without booking a real lesson.
 * Runs the same connector calls the booking functions run and shows what
 * came back, plus the subscription feed as the no-API fallback.
 */
const CalendarHealth = () => {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [probing, setProbing] = useState(false);

  const run = useCallback(async (probeWrite: boolean) => {
    if (probeWrite) setProbing(true);
    else setLoading(true);
    try {
      const { data, error } = await invokeAdmin({
        action: "calendar_health",
        probe_write: probeWrite,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const raw = (data?.data ?? {}) as Partial<Health>;
      const normalized: Health = {
        keys: { lovable: false, googleCalendar: false, ...(raw.keys ?? {}) },
        read: { ok: false, status: null, detail: null, ...(raw.read ?? {}) },
        write: raw.write ? { ok: false, status: null, detail: null, ...raw.write } : null,
        bookings: {
          total: 0,
          synced: 0,
          failed: 0,
          unsynced: [],
          ...(raw.bookings ?? {}),
        },
        feed: { configured: false, url: null, ...(raw.feed ?? {}) },
      };
      setHealth(normalized);
      if (probeWrite) {
        const w = (data.data as Health).write;
        toast({
          title: w?.ok
            ? "Test reușit — evenimentul a fost creat și șters"
            : "Testul de scriere a eșuat",
          variant: w?.ok ? undefined : "destructive",
        });
      }
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Verificarea a eșuat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProbing(false);
    }
  }, []);

  useEffect(() => {
    void run(false);
  }, [run]);

  const copyFeed = async () => {
    if (!health?.feed.url) return;
    try {
      await navigator.clipboard.writeText(health.feed.url);
      toast({ title: "Link copiat" });
    } catch {
      toast({ title: "Nu am putut copia linkul", variant: "destructive" });
    }
  };

  const keysOk = !!health && health.keys.lovable && health.keys.googleCalendar;
  const syncOk = !!health?.read.ok;

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarCheck className="h-4 w-4" aria-hidden />
            Sincronizare Google Calendar
          </h2>
          <p className="text-sm text-muted-foreground">
            Verifică dacă rezervările ajung efectiv în calendarul tău.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => run(false)} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
            )}
            Verifică
          </Button>
          <Button
            size="sm"
            onClick={() => run(true)}
            disabled={probing || loading || !syncOk}
            title={
              syncOk
                ? "Creează un eveniment de test și îl șterge imediat"
                : "Disponibil doar după ce conexiunea de citire funcționează"
            }
          >
            {probing ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden /> : null}
            Test complet
          </Button>
        </div>
      </div>

      {loading && !health ? (
        <p className="text-sm text-muted-foreground">Se verifică…</p>
      ) : !health ? (
        <p className="text-sm text-muted-foreground">Verificarea nu a putut fi rulată.</p>
      ) : (
        <div className="space-y-4">
          {!syncOk && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="min-w-0">
                Rezervările <strong>nu</strong> ajung în Google Calendar și intervalele ocupate
                din calendar <strong>nu</strong> blochează sloturile de pe site. Rezervările sunt
                salvate corect în baza de date și confirmările pleacă normal — doar calendarul
                lipsește. Folosește feed-ul de abonare de mai jos până când conexiunea e
                reparată.
              </p>
            </div>
          )}

          <ul className="space-y-2">
            <Row
              ok={health.keys.lovable}
              label="Secret LOVABLE_API_KEY"
              detail={health.keys.lovable ? null : "Lipsește din secretele Supabase."}
            />
            <Row
              ok={health.keys.googleCalendar}
              label="Secret GOOGLE_CALENDAR_API_KEY"
              detail={
                health.keys.googleCalendar
                  ? null
                  : "Lipsește — se obține conectând Google Calendar în Lovable."
              }
            />
            <Row
              ok={health.read.ok}
              label="Citire calendar (intervale ocupate)"
              detail={
                health.read.ok
                  ? null
                  : `${health.read.status ?? "fără răspuns"}${health.read.detail ? ` — ${health.read.detail}` : ""}`
              }
            />
            {health.write ? (
              <Row
                ok={health.write.ok}
                label="Scriere calendar (creare eveniment)"
                detail={
                  health.write.ok
                    ? "Evenimentul de test a fost creat și șters."
                    : `${health.write.status ?? "fără răspuns"}${health.write.detail ? ` — ${health.write.detail}` : ""}`
                }
              />
            ) : null}
          </ul>

          <div className="rounded-md border border-border p-3">
            <p className="text-sm font-medium text-foreground">
              Rezervări confirmate (ultimele 6 luni)
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {health.bookings.synced} din {health.bookings.total} au ajuns în Google Calendar.
            </p>
            {health.bookings.unsynced.length > 0 && (
              <ul className="mt-2 space-y-1">
                {health.bookings.unsynced.map((b) => (
                  <li key={b.id} className="text-xs text-muted-foreground">
                    {fmt(b.start_at)} — {b.student_name}
                    {b.error ? ` (${b.error})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-md border border-border p-3">
            <p className="text-sm font-medium text-foreground">
              Feed de abonare (funcționează fără conector)
            </p>
            {health.feed.configured && health.feed.url ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  În Google Calendar: <em>Alte calendare → + → De la URL</em>, lipește linkul de
                  mai jos. Rezervările apar automat, în sens unic.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                    {health.feed.url}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyFeed}>
                    <Copy className="mr-1.5 h-4 w-4" aria-hidden />
                    Copiază
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Neconfigurat. Adaugă în Supabase secretul{" "}
                <code className="rounded bg-muted px-1">OWNER_CALENDAR_TOKEN</code> cu o valoare
                lungă și aleatorie, apoi reverifică — linkul de abonare va apărea aici.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CalendarHealth;
