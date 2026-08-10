import { useEffect, useMemo, useRef, useState } from "react";
import { invokeBacklinks, formatNumber, type BacklinkSnapshot } from "@/lib/backlinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, Upload, Trash2, Link2, TrendingUp, ShieldAlert, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface SnapshotForm {
  snapshot_date: string;
  authority_score: string;
  trust_score: string;
  backlinks_total: string;
  referring_domains: string;
  follow_links: string;
  nofollow_links: string;
}

interface TopDomain {
  domain: string;
  links: number;
}

const SOURCE_LABELS: Record<string, string> = {
  open_pagerank: "auto",
  semrush: "Semrush",
  gsc_csv: "GSC CSV",
  manual: "manual",
  unknown: "—",
};

function SourceBadge({ source }: { source?: string | null }) {
  if (!source) return null;
  return (
    <Badge variant="secondary" className="text-[10px] font-normal">
      {SOURCE_LABELS[source] ?? source}
    </Badge>
  );
}

const emptyForm = (): SnapshotForm => ({
  snapshot_date: new Date().toISOString().slice(0, 10),
  authority_score: "",
  trust_score: "",
  backlinks_total: "",
  referring_domains: "",
  follow_links: "",
  nofollow_links: "",
});

function parseNumber(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === "," || ch === ";" || ch === "\t") && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((v) => v.trim().replace(/^"|"$/g, ""));
}

/**
 * Export "Linkuri → Site-uri care fac linkuri" din Google Search Console:
 * o linie per domeniu referitor, cu numărul de pagini care fac linkuri.
 */
function parseGscLinksCsv(
  lines: string[],
): { form: Partial<SnapshotForm>; topDomains: TopDomain[] } | null {
  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const looksLikeGsc =
    headers.some((h) => h.includes("site") || h.includes("domeniu")) &&
    headers.some(
      (h) =>
        h.includes("linking pages") ||
        h.includes("pagini care fac") ||
        h.includes("incoming links") ||
        h.includes("linkuri"),
    );
  if (!looksLikeGsc) return null;

  const siteIdx = headers.findIndex((h) => h.includes("site") || h.includes("domeniu"));
  const linksIdx = headers.findIndex(
    (h) =>
      h.includes("linking pages") ||
      h.includes("pagini care fac") ||
      h.includes("incoming links") ||
      h.includes("linkuri"),
  );

  const rows: TopDomain[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const domain = cells[siteIdx];
    if (!domain) continue;
    const links = parseNumber(cells[linksIdx] ?? "") ?? 0;
    rows.push({ domain, links });
  }
  if (rows.length === 0) return null;

  const total = rows.reduce((sum, r) => sum + r.links, 0);
  return {
    form: {
      snapshot_date: new Date().toISOString().slice(0, 10),
      referring_domains: String(rows.length),
      backlinks_total: String(total),
    },
    topDomains: rows.sort((a, b) => b.links - a.links).slice(0, 20),
  };
}

function parseCsvOverview(text: string): Partial<SnapshotForm> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return {};

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const values = lines[1].split(",").map((v) => v.trim());

  const get = (names: string[]) => {
    for (const name of names) {
      const idx = headers.findIndex((h) => h.includes(name));
      if (idx >= 0) return values[idx] ?? "";
    }
    return "";
  };

  return {
    snapshot_date: new Date().toISOString().slice(0, 10),
    authority_score: get(["authority", "ascore", "as"]),
    trust_score: get(["trust", "trust_score"]),
    backlinks_total: get(["backlinks", "total", "links"]),
    referring_domains: get(["domains", "referring domains", "domains_num"]),
    follow_links: get(["follow", "follows", "follows_num"]),
    nofollow_links: get(["nofollow", "nofollows", "nofollows_num"]),
  };
}

function parseCsv(
  text: string,
): { form: Partial<SnapshotForm>; topDomains: TopDomain[]; source: "gsc_csv" | "manual" } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { form: {}, topDomains: [], source: "manual" };

  const gsc = parseGscLinksCsv(lines);
  if (gsc) return { ...gsc, source: "gsc_csv" };

  return { form: parseCsvOverview(text), topDomains: [], source: "manual" };
}

function Sparkline({ values, color = "#3B82F6" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 300;
  const height = 60;
  const padding = 4;
  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points.join(" ")}
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.split(",")[0]} cy={p.split(",")[1]} r="3" fill={color} />
      ))}
    </svg>
  );
}

interface FetchAttempt {
  id: string;
  attempted_at: string;
  trigger_source: "manual" | "cron";
  provider: string;
  outcome: "success" | "not_configured" | "api_unavailable" | "parse_error" | "error";
  http_status: number | null;
  detail: string | null;
}

const OUTCOME_LABELS: Record<FetchAttempt["outcome"], string> = {
  success: "Reușit",
  not_configured: "Neconfigurat",
  api_unavailable: "API indisponibil (plan Semrush)",
  parse_error: "Răspuns neinterpretabil",
  error: "Eroare",
};

/**
 * Refresh status. A failed automatic attempt never writes or overwrites a
 * snapshot, so the "last successful snapshot" below stays authoritative even
 * while the live API is unavailable on the current Semrush plan.
 */
function RefreshStatus({
  attempts,
  latest,
}: {
  attempts: FetchAttempt[];
  latest?: BacklinkSnapshot;
}) {
  const lastAttempt = attempts[0];
  const lastSuccess = attempts.find((a) => a.outcome === "success");
  const fmt = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div className="mb-4 grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Ultimul snapshot valid</p>
        <p className="text-sm font-semibold text-foreground">{latest?.snapshot_date ?? "—"}</p>
        <p className="text-xs text-muted-foreground">
          Sursă: {latest?.source ? SOURCE_LABELS[latest.source] ?? latest.source : "—"}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Ultima încercare automată</p>
        <p className="text-sm font-semibold text-foreground">{fmt(lastAttempt?.attempted_at)}</p>
        <p className="text-xs text-muted-foreground">
          {lastAttempt ? `${lastAttempt.trigger_source === "cron" ? "Programat" : "Manual"}` : "Nicio încercare înregistrată"}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Status reîmprospătare</p>
        <p
          className={`text-sm font-semibold ${
            !lastAttempt
              ? "text-muted-foreground"
              : lastAttempt.outcome === "success"
                ? "text-emerald-600"
                : "text-amber-600"
          }`}
        >
          {lastAttempt ? OUTCOME_LABELS[lastAttempt.outcome] : "Necunoscut"}
        </p>
        {lastAttempt?.http_status ? (
          <p className="text-xs text-muted-foreground">HTTP {lastAttempt.http_status}</p>
        ) : null}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Ultima reușită prin API</p>
        <p className="text-sm font-semibold text-foreground">{fmt(lastSuccess?.attempted_at)}</p>
        <p className="text-xs text-muted-foreground">
          {lastSuccess ? "API funcțional" : "Datele curente provin din import manual"}
        </p>
      </div>
    </div>
  );
}

export default function BacklinksAdmin() {
  const [snapshots, setSnapshots] = useState<BacklinkSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingFree, setRefreshingFree] = useState(false);
  const [form, setForm] = useState<SnapshotForm>(emptyForm());
  const [csvTopDomains, setCsvTopDomains] = useState<TopDomain[]>([]);
  const [csvSource, setCsvSource] = useState<"gsc_csv" | "manual">("manual");
  const [attempts, setAttempts] = useState<FetchAttempt[]>([]);
  const [savingManual, setSavingManual] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeBacklinks<{ data: BacklinkSnapshot[] }>({ action: "list" });
      if (error) throw error;
      setSnapshots(data?.data ?? []);
      // Refresh history is informational: never let it fail the snapshot load.
      try {
        const { data: att } = await invokeBacklinks<{ data: FetchAttempt[] }>({ action: "attempts" });
        setAttempts(att?.data ?? []);
      } catch {
        /* older deployed function without the "attempts" action */
      }
    } catch (err) {
      toast({
        title: "Eroare la încărcarea snapshot-urilor",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const latest = snapshots[0];

  const trends = useMemo(() => {
    const ordered = [...snapshots].sort((a, b) =>
      new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    );
    return {
      authority: ordered.map((s) => s.authority_score ?? 0).filter((v) => v > 0),
      trust: ordered.map((s) => s.trust_score ?? 0).filter((v) => v > 0),
      backlinks: ordered.map((s) => s.backlinks_total ?? 0).filter((v) => v > 0),
      domains: ordered.map((s) => s.referring_domains ?? 0).filter((v) => v > 0),
    };
  }, [snapshots]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await invokeBacklinks<{ data: BacklinkSnapshot }>({ action: "fetch_live" });
      if (error) throw error;
      if (data && typeof data === "object" && "error" in data) {
        throw new Error((data as { error: string }).error);
      }
      toast({ title: "Snapshot actualizat" });
      await load();
    } catch (err) {
      toast({
        title: "Actualizare eșuată",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleFreeRefresh = async () => {
    setRefreshingFree(true);
    try {
      const { data, error } = await invokeBacklinks<{ data: BacklinkSnapshot }>({
        action: "fetch_free",
      });
      if (error) throw error;
      if (data && typeof data === "object" && "error" in data) {
        throw new Error((data as { error: string }).error);
      }
      toast({ title: "Snapshot actualizat automat" });
      await load();
    } catch (err) {
      toast({
        title: "Actualizare automată eșuată",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setRefreshingFree(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const { form: parsed, topDomains, source } = parseCsv(text);
      setForm((prev) => ({ ...prev, ...parsed }));
      setCsvTopDomains(topDomains);
      setCsvSource(source);
      toast({
        title: source === "gsc_csv" ? "CSV Google Search Console detectat" : "Date CSV extrase",
        description:
          source === "gsc_csv"
            ? `${topDomains.length > 0 ? parsed.referring_domains : 0} domenii referitoare detectate. Verifică valorile înainte de salvare.`
            : "Verifică valorile înainte de salvare.",
      });
    };
    reader.readAsText(file);
  };

  const handleSaveManual = async () => {
    setSavingManual(true);
    try {
      const payload = {
        action: "upsert_manual",
        snapshot_date: form.snapshot_date,
        authority_score: parseNumber(form.authority_score),
        trust_score: parseNumber(form.trust_score),
        backlinks_total: parseNumber(form.backlinks_total),
        referring_domains: parseNumber(form.referring_domains),
        follow_links: parseNumber(form.follow_links),
        nofollow_links: parseNumber(form.nofollow_links),
        top_referring_domains: csvTopDomains,
        source: csvSource,
        metric_sources: {
          authority_score: "manual",
          trust_score: "manual",
          backlinks_total: csvSource,
          referring_domains: csvSource,
          follow_links: "manual",
          nofollow_links: "manual",
        },
      };
      const { error } = await invokeBacklinks(payload);
      if (error) throw error;
      toast({ title: "Snapshot salvat" });
      setForm(emptyForm());
      setCsvTopDomains([]);
      setCsvSource("manual");
      await load();
    } catch (err) {
      toast({
        title: "Salvare eșuată",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSavingManual(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await invokeBacklinks({ action: "delete", id });
      if (error) throw error;
      toast({ title: "Snapshot șters" });
      await load();
    } catch (err) {
      toast({
        title: "Ștergere eșuată",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  const followRatio =
    latest && (latest.follow_links || 0) + (latest.nofollow_links || 0) > 0
      ? Math.round(
          ((latest.follow_links || 0) /
            ((latest.follow_links || 0) + (latest.nofollow_links || 0))) *
            100,
        )
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Sănătate backlink-uri</h2>
          <p className="text-sm text-muted-foreground">
            Urmărește evoluția profilului de link-uri pentru {latest?.domain ?? "centruldearabalibaneza.com"}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleFreeRefresh} disabled={refreshingFree || loading}>
            {refreshingFree && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {!refreshingFree && <RefreshCw className="w-4 h-4 mr-2" />}
            Actualizează automat (gratuit)
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing || loading}>
            {refreshing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Actualizează din Semrush
          </Button>
        </div>
      </div>

      <RefreshStatus attempts={attempts} latest={latest} />

      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 flex-wrap">
                <TrendingUp className="w-3.5 h-3.5" /> Authority Score
                <SourceBadge source={latest.metric_sources?.authority_score} />
              </CardDescription>
              <CardTitle>{latest.authority_score ?? "—"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Sparkline values={trends.authority} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 flex-wrap">
                <ShieldAlert className="w-3.5 h-3.5" /> Trust Score
                <SourceBadge source={latest.metric_sources?.trust_score} />
              </CardDescription>
              <CardTitle>{latest.trust_score ?? "—"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Sparkline values={trends.trust} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 flex-wrap">
                <Link2 className="w-3.5 h-3.5" /> Backlink-uri totale
                <SourceBadge source={latest.metric_sources?.backlinks_total} />
              </CardDescription>
              <CardTitle>{formatNumber(latest.backlinks_total)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Sparkline values={trends.backlinks} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 flex-wrap">
                <Globe className="w-3.5 h-3.5" /> Domenii referitoare
                <SourceBadge source={latest.metric_sources?.referring_domains} />
              </CardDescription>
              <CardTitle>{formatNumber(latest.referring_domains)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Sparkline values={trends.domains} />
            </CardContent>
          </Card>
        </div>
      )}

      {latest && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Raport follow / nofollow</CardTitle>
              <CardDescription>
                {followRatio !== null
                  ? `${followRatio}% follow — restul sunt nofollow sau neclasificate`
                  : "Nu există suficiente date"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${followRatio ?? 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {formatNumber(latest.follow_links)} / {formatNumber(latest.nofollow_links)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ultimul snapshot</CardTitle>
              <CardDescription>{latest.snapshot_date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {snapshots.length} snapshot{snapshots.length === 1 ? "" : "-uri"} salvate în baza de date. O încercare eșuată nu suprascrie niciodată ultimul snapshot valid.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Istoric snapshot-uri</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : snapshots.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Nicio înregistrare. Apasă „Actualizează din Semrush” sau adaugă manual un snapshot.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>AS</TableHead>
                  <TableHead>Trust</TableHead>
                  <TableHead>Backlink-uri</TableHead>
                  <TableHead>Domenii</TableHead>
                  <TableHead>Follow</TableHead>
                  <TableHead>Nofollow</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.snapshot_date}</TableCell>
                    <TableCell>{formatNumber(s.authority_score)}</TableCell>
                    <TableCell>{formatNumber(s.trust_score)}</TableCell>
                    <TableCell>{formatNumber(s.backlinks_total)}</TableCell>
                    <TableCell>{formatNumber(s.referring_domains)}</TableCell>
                    <TableCell>{formatNumber(s.follow_links)}</TableCell>
                    <TableCell>{formatNumber(s.nofollow_links)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(s.id)}
                        title="Șterge snapshot"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adaugă snapshot manual</CardTitle>
          <CardDescription>
            Sursa gratuită automată (Open PageRank) actualizează doar Authority Score. Pentru
            numărul de backlink-uri și domenii referitoare, exportă CSV-ul „Linkuri → Site-uri care
            fac linkuri” din Google Search Console și încarcă-l aici. Se acceptă și export din
            Semrush Backlinks Analytics sau completare directă.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              <Upload className="w-4 h-4 mr-2" />
              Încarcă CSV
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
            {csvSource === "gsc_csv" && (
              <Badge variant="secondary">Format Google Search Console detectat</Badge>
            )}
          </div>

          {csvTopDomains.length > 0 && (
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium mb-2">
                Top domenii referitoare detectate ({csvTopDomains.length} afișate)
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                {csvTopDomains.map((d) => (
                  <li key={d.domain} className="flex justify-between gap-3">
                    <span className="truncate">{d.domain}</span>
                    <span className="tabular-nums">{formatNumber(d.links)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={form.snapshot_date}
                onChange={(e) => setForm((p) => ({ ...p, snapshot_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Authority Score</label>
              <Input
                value={form.authority_score}
                onChange={(e) => setForm((p) => ({ ...p, authority_score: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Trust Score</label>
              <Input
                value={form.trust_score}
                onChange={(e) => setForm((p) => ({ ...p, trust_score: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Backlink-uri totale</label>
              <Input
                value={form.backlinks_total}
                onChange={(e) => setForm((p) => ({ ...p, backlinks_total: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Domenii referitoare</label>
              <Input
                value={form.referring_domains}
                onChange={(e) => setForm((p) => ({ ...p, referring_domains: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Follow</label>
              <Input
                value={form.follow_links}
                onChange={(e) => setForm((p) => ({ ...p, follow_links: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nofollow</label>
              <Input
                value={form.nofollow_links}
                onChange={(e) => setForm((p) => ({ ...p, nofollow_links: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <Button onClick={handleSaveManual} disabled={savingManual}>
            {savingManual && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Salvează snapshot manual
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
