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
  Eye,
  EyeOff,
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
    /** The last 30 days by booking date — whether the sync works now. */
    latest: { total: number; synced: number };
    unsynced: Array<{
      id: string;
      start_at: string;
      student_name: string;
      error: string | null;
    }>;
  };
  feed: { configured: boolean; url: string | null };
  /**
   * Upcoming lessons whose Google event no longer agrees with the panel.
   *
   * null means the check could not run (Google unreadable, or not connected),
   * which is different from an empty list meaning everything agrees — and the
   * difference matters, because "nothing to report" and "I could not look" read
   * identically if you print them the same way.
   */
  drift:
    | null
    | Array<{
        id: string;
        student_name: string | null;
        booked_at: string;
        google_at: string | null;
        kind: "moved" | "cancelled_in_google" | "not_found";
      }>;
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
/**
 * Replaces the token in the feed URL with bullets, keeping enough of the shape
 * for the owner to recognise the right link without reading the secret out.
 */
function maskToken(url: string): string {
  return url.replace(/([?&]token=)([^&]+)/i, (_m, prefix: string, token: string) => {
    const tail = token.length > 4 ? token.slice(-4) : "";
    return `${prefix}${"•".repeat(12)}${tail}`;
  });
}

const CalendarHealth = () => {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [probing, setProbing] = useState(false);
  const [showFeedUrl, setShowFeedUrl] = useState(false);

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
        write: raw.write ? { ok: false, status: null, detail: null, ...(raw.write as Partial<NonNullable<Health["write"]>>) } : null,
        bookings: {
          total: 0,
          synced: 0,
          failed: 0,
          latest: { total: 0, synced: 0 },
          unsynced: [],
          ...(raw.bookings ?? {}),
        },
        feed: { configured: false, url: null, ...(raw.feed ?? {}) },
        drift: raw.drift === undefined ? null : raw.drift,
      };
      setHealth(normalized);
      if (probeWrite) {
        const w = normalized.write;
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
              Sincronizarea acum
            </p>
            {health.bookings.latest.total === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Nicio rezervare nouă în ultimele 30 de zile, deci nu există nimic recent de
                verificat. Istoricul de mai jos rămâne valabil.
              </p>
            ) : health.bookings.latest.synced === health.bookings.latest.total ? (
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                Funcționează: toate cele {health.bookings.latest.total} rezervări din ultimele 30
                de zile au ajuns în Google Calendar.
              </p>
            ) : (
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                {health.bookings.latest.synced} din {health.bookings.latest.total} rezervări din
                ultimele 30 de zile au ajuns în Google Calendar. Asta e o problemă acum.
              </p>
            )}
            {/* The six-month figure used to be the only one here, so a run of
                failures months ago read as a fault happening today. It is
                history, and it is labelled as history. */}
            <p className="mt-2 text-xs text-muted-foreground">
              Istoric, ultimele 6 luni: {health.bookings.synced} din {health.bookings.total}.
              {health.bookings.failed > 0 &&
                " Rezervările trecute care nu au ajuns nu mai pot fi recuperate — evenimentul nu va apărea retroactiv."}
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
                {/* The link carries OWNER_CALENDAR_TOKEN, and the token is the
                    whole of the authentication: anyone holding this URL can
                    read every booking. Printing it in full meant it was on
                    screen during any screen-share or over any shoulder, so it
                    stays masked until asked for. Copying never needs it
                    revealed. */}
                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-[4px] bg-muted px-2 py-1 text-xs">
                    {showFeedUrl ? health.feed.url : maskToken(health.feed.url)}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeedUrl((v) => !v)}
                    aria-pressed={showFeedUrl}
                  >
                    {showFeedUrl ? (
                      <EyeOff className="mr-1.5 h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="mr-1.5 h-4 w-4" aria-hidden />
                    )}
                    {showFeedUrl ? "Ascunde" : "Arată"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyFeed}>
                    <Copy className="mr-1.5 h-4 w-4" aria-hidden />
                    Copiază
                  </Button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Linkul conține o cheie secretă: cine îl are poate citi toate rezervările. Nu
                  îl arăta pe ecran partajat și nu îl pune într-un calendar public.
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Neconfigurat. Adaugă în Supabase secretul{" "}
                <code className="rounded-[4px] bg-muted px-1">OWNER_CALENDAR_TOKEN</code> cu o valoare
                lungă și aleatorie, apoi reverifică — linkul de abonare va apărea aici.
              </p>
            )}
          </div>

          {/* The half of the sync that did not exist: lessons written to
              Google and then changed there, which the panel never learned
              about. Read-only on purpose — it reports, it does not rewrite a
              real lesson's time from a calendar match. */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Lecții modificate în Google Calendar
            </h3>
            {health.drift === null ? (
              <p className="mt-1 text-sm text-muted-foreground">
                N-am putut verifica acum (Google Calendar n-a răspuns). Restul verificărilor de
                mai sus sunt valabile.
              </p>
            ) : health.drift.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Toate lecțiile viitoare au în Google aceeași oră pe care o arată panoul.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Astea au fost schimbate direct în Google, așa că panoul, emailurile și
                  memento-urile folosesc încă ora veche. Pune ora nouă din Programări → Mută
                  lecția, ca să afle și cursantul.
                </p>
                <ul className="mt-3 space-y-2">
                  {health.drift.map((d) => (
                    <li
                      key={d.id}
                      className="rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
                    >
                      <span className="font-medium">{d.student_name ?? "Cursant necunoscut"}</span>
                      {d.kind === "moved" && d.google_at ? (
                        <>
                          {" "}
                          — în panou {fmt(d.booked_at)}, în Google {fmt(d.google_at)}.
                        </>
                      ) : d.kind === "cancelled_in_google" ? (
                        <> — {fmt(d.booked_at)}, dar evenimentul e anulat în Google.</>
                      ) : (
                        <>
                          {" "}
                          — {fmt(d.booked_at)}, dar evenimentul nu mai există în Google (șters, sau
                          mutat foarte departe).
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CalendarHealth;
