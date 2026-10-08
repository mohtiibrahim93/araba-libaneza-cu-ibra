import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarX2,
  ExternalLink,
  Loader2,
  RefreshCw,
  RotateCcw,
  TrendingUp,
  Undo2,
  Users,
  Wallet,
} from "lucide-react";
import { invokeAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { ErrorNote, Loading, ScreenToolbar, Section, StatTile } from "./ui";
import { leadStatusLabels, paymentStatusLabels } from "./types";

/**
 * The time dimension the rest of the panel does not have.
 *
 * Every other number in the admin counts all of time — the four stat cards,
 * the trial funnel, the student journey — so "is this month better than last"
 * has never been answerable here. This screen answers it from the database,
 * over a window you choose.
 *
 * What it deliberately does not show, so it can never disagree with something
 * else on screen:
 *   - Revenue. There is no amount column on `registrations`; any figure would
 *     be re-derived from cohort list prices times months and would quietly
 *     ignore discounts. Refunds are exact, so those are here.
 *   - Cohort fill. "Grupe" already computes it, including the manual offset.
 *   - Traffic. That is Google Analytics (property G-F167Y815JL), linked at the
 *     bottom. `source` here is how the row was created — form, WhatsApp or by
 *     hand — not where the person came from, and it is labelled as such.
 */

const RANGES = [
  { days: 30, label: "30 zile" },
  { days: 90, label: "90 zile" },
  { days: 365, label: "12 luni" },
  { days: 730, label: "2 ani" },
] as const;

/** Fixed slot order for the stacked bars — never cycled. */
const FORM_TYPES = [
  { key: "trial", label: "Probă", css: "var(--series-1)" },
  { key: "group", label: "Grupă", css: "var(--series-2)" },
  { key: "private", label: "Privat", css: "var(--series-3)" },
  { key: "kids", label: "Copii", css: "var(--series-4)" },
] as const;

interface Counts {
  [key: string]: number;
}
/** `week` is the Monday's date; every other key is a form_type count. */
interface WeekRow {
  week: string;
  total: number;
  [formType: string]: string | number;
}
interface Analytics {
  range: { days: number; from: string; to: string };
  signups: {
    total: number;
    byWeek: WeekRow[];
    byFormType: Counts;
    byFormat: Counts;
    byLevel: Counts;
    byLanguage: Counts;
    bySource: Counts;
    byReferral: Counts;
  };
  conversion: {
    registrations: number;
    paid: number;
    paidPercent: number;
    byPaymentStatus: Counts;
    byLeadStatus: Counts;
    medianDaysToPay: number | null;
  };
  refunds: { count: number; totalMinorUnits: number };
  lessons: {
    total: number;
    byStatus: Counts;
    byEventType: Counts;
    byFormat: Counts;
    trials: number;
    rescheduled: number;
    lateCancels: number;
  };
}

/** A week row's count for one course type; the index type also covers `week`. */
const count = (w: WeekRow, key: string): number => {
  const v = w[key];
  return typeof v === "number" ? v : 0;
};

const weekLabel = (iso: string) =>
  new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "short" }).format(new Date(iso));

/** A count list, biggest first, with the raw key kept when it is unlabelled. */
const Breakdown = ({
  title,
  counts,
  labels,
  note,
}: {
  title: string;
  counts: Counts;
  labels?: Record<string, string>;
  note?: string;
}) => {
  const rows = Object.entries(counts ?? {}).sort(([, a], [, b]) => b - a);
  const total = rows.reduce((sum, [, n]) => sum + n, 0);
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nimic în această perioadă.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map(([key, n]) => (
            <li key={key} className="text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-foreground">{labels?.[key] ?? key}</span>
                <span className="tabular-nums text-muted-foreground">
                  {n}
                  {total > 0 && (
                    <span className="ml-1.5 text-xs">({Math.round((n / total) * 100)}%)</span>
                  )}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{ width: total > 0 ? `${(n / total) * 100}%` : "0%" }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AnalyticsAdmin = () => {
  const [days, setDays] = useState<number>(90);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (window: number) => {
    setLoading(true);
    setError("");
    try {
      const { data: res, error: err } = await invokeAdmin({ action: "list_analytics", days: window });
      if (err) throw err;
      if (res?.error) throw new Error(res.error);
      setData(res?.data ?? null);
    } catch (e) {
      console.error("[analytics] load failed", e);
      setError("Datele nu au putut fi încărcate.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  const weeks = data?.signups.byWeek ?? [];
  const peak = useMemo(() => Math.max(1, ...weeks.map((w) => w.total)), [weeks]);

  const cards = data
    ? [
        {
          label: "Înscrieri",
          value: data.signups.total,
          hint: "în perioada aleasă",
          icon: Users,
        },
        {
          label: "Plătite",
          value: data.conversion.paid,
          hint: `${data.conversion.paidPercent}% din înscrieri`,
          icon: Wallet,
        },
        {
          label: "Zile până la plată",
          value: data.conversion.medianDaysToPay === null
            ? "—"
            : Math.round(data.conversion.medianDaysToPay * 10) / 10,
          hint: "mediană, nu medie",
          icon: TrendingUp,
        },
        {
          label: "Lecții",
          value: data.lessons.total,
          hint: `${data.lessons.trials} de probă`,
          icon: BarChart3,
        },
      ]
    : [];

  return (
    <section className="space-y-6">
      <ScreenToolbar>
        <div className="flex rounded-lg border border-border p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              aria-pressed={days === r.days}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                days === r.days
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => void load(days)} disabled={loading} aria-label="Reîncarcă">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </ScreenToolbar>

      {error && <ErrorNote>{error}</ErrorNote>}

      {loading && !data && <Loading label="Se încarcă…" />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cards.map((c) => (
              <StatTile key={c.label} label={c.label} value={c.value} hint={c.hint} icon={c.icon} />
            ))}
          </div>

          {/* Weekly sign-ups. Stacked by course type, with a legend and the
              numbers repeated in the table below — two of the four series sit
              under 3:1 contrast on the light surface, so colour alone is never
              the only way to read this. */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">Înscrieri pe săptămână</h3>
              <ul className="flex flex-wrap items-center gap-3">
                {FORM_TYPES.map((f) => (
                  <li key={f.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: f.css }}
                      aria-hidden="true"
                    />
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>

            {weeks.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Nicio înscriere în această perioadă.
              </p>
            ) : (
              <>
                <div
                  className="mt-5 flex h-44 items-end gap-1 overflow-x-auto"
                  role="img"
                  aria-label={`Înscrieri pe săptămână, ${weeks.length} săptămâni, maxim ${peak} într-o săptămână. Cifrele exacte sunt în tabelul de mai jos.`}
                >
                  {weeks.map((w) => (
                    <div
                      key={w.week}
                      // Full height with the content pushed to the bottom: the
                      // bar's own percentage height needs a resolved parent, and
                      // on an auto-height column every bar collapses to its
                      // min-heights instead.
                      className="flex h-full min-w-[14px] flex-1 flex-col justify-end"
                    >
                      <div
                        className="flex w-full flex-col justify-end gap-0.5"
                        style={{ height: `${(w.total / peak) * 100}%` }}
                        title={`Săptămâna ${weekLabel(w.week)} — ${w.total} înscrieri`}
                      >
                        {FORM_TYPES.filter((f) => count(w, f.key) > 0).map((f, i) => (
                          <div
                            key={f.key}
                            className={i === 0 ? "rounded-t" : ""}
                            style={{
                              backgroundColor: f.css,
                              // Share of this week's bar, so the segments add
                              // up to the bar's own height.
                              flexGrow: count(w, f.key),
                              minHeight: 2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="pb-2 text-left text-xs text-muted-foreground">
                      Aceleași cifre, exacte
                    </caption>
                    <thead className="border-b border-border text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-3 font-medium">Săptămâna</th>
                        {FORM_TYPES.map((f) => (
                          <th key={f.key} className="py-2 pr-3 font-medium">
                            {f.label}
                          </th>
                        ))}
                        <th className="py-2 pr-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...weeks].reverse().map((w) => (
                        <tr key={w.week} className="border-b border-border/60">
                          <td className="py-2 pr-3 text-foreground">{weekLabel(w.week)}</td>
                          {FORM_TYPES.map((f) => (
                            <td key={f.key} className="py-2 pr-3 tabular-nums text-muted-foreground">
                              {count(w, f.key)}
                            </td>
                          ))}
                          <td className="py-2 pr-3 font-semibold tabular-nums text-foreground">
                            {w.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Lessons: the numbers the 24-hour rule is about. */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold text-foreground">Lecții în perioadă</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              După data lecției, nu după data rezervării.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Confirmate", value: data.lessons.byStatus["confirmed"] ?? 0, icon: BarChart3 },
                { label: "Anulate", value: data.lessons.byStatus["cancelled"] ?? 0, icon: Undo2 },
                { label: "Reprogramate", value: data.lessons.rescheduled, icon: RotateCcw },
                {
                  label: "Anulate sub 24h",
                  value: data.lessons.lateCancels,
                  icon: CalendarX2,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                  <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Anulările sub 24 de ore nu mai sunt posibile din linkul cursantului. Dacă acest număr
              crește, sunt anulări făcute din panou — adică situații pe care le-ai aprobat tu.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Breakdown
              title="Tip de curs"
              counts={data.signups.byFormType}
              labels={{ trial: "Probă", group: "Grupă", private: "Privat", kids: "Copii" }}
            />
            <Breakdown
              title="Format"
              counts={data.signups.byFormat}
              labels={{ online: "Online", fizic: "Fizic", physical: "Fizic" }}
            />
            <Breakdown
              title="Status plată"
              counts={data.conversion.byPaymentStatus}
              labels={paymentStatusLabels}
            />
            <Breakdown
              title="Nivel"
              counts={data.signups.byLevel}
              note="„—” înseamnă că nivelul nu a fost completat."
            />
            <Breakdown
              title="Limba site-ului"
              counts={data.signups.byLanguage}
              labels={{ ro: "Română", en: "Engleză" }}
            />
            <Breakdown
              title="Cum a intrat cererea"
              counts={data.signups.bySource}
              labels={{
                form: "Formular",
                whatsapp: "WhatsApp",
                admin: "Adăugat manual",
                tiktok: "TikTok",
                instagram: "Instagram",
                direct: "Direct",
                telefon: "Telefon",
                other: "Altă sursă",
              }}
              note="Pentru înscrierile de pe site: cum a fost creată înregistrarea. Pentru cele adăugate manual: de unde a venit cursantul."
            />
            <Breakdown
              title="Status lead"
              counts={data.conversion.byLeadStatus}
              labels={leadStatusLabels}
            />
            {Object.keys(data.signups.byReferral ?? {}).length > 0 && (
              <Breakdown title="Cod de recomandare" counts={data.signups.byReferral} />
            )}
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-foreground">Rambursări</p>
              <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">
                {data.refunds.count}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {data.refunds.count === 0
                  ? "Nicio rambursare în perioadă."
                  : `${(data.refunds.totalMinorUnits / 100).toLocaleString("ro-RO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} lei returnați`}
              </p>
            </div>
          </div>

          {/* Traffic is Google's job, and the property is already collecting. */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <h3 className="text-sm font-semibold text-foreground">Trafic și căutări</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Vizitatori, surse de trafic și cuvinte căutate nu sunt aici: le colectează Google
              Analytics (proprietatea <span className="font-mono text-xs">G-F167Y815JL</span>), doar
              pentru vizitatorii care acceptă cookie-urile de analiză. Pagina aceasta arată ce știe
              baza ta de date — adică ce s-a întâmplat după ce cineva a completat un formular.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
                  Google Analytics
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Search Console
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Perioadă: ultimele {data.range.days} de zile. Înscrierile anonimizate (GDPR) nu sunt
            numărate. Încasările nu apar aici: nu există o coloană de sumă pe înscrieri, iar o cifră
            calculată din prețurile de listă ar ignora reducerile. Rambursările sunt sume reale.
          </p>
        </>
      )}
    </section>
  );
};

export default AnalyticsAdmin;
