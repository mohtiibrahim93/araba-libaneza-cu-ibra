import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

const TARGET_DOMAIN = "centruldearabalibaneza.com";
const GATEWAY_BASE = "https://connector-gateway.lovable.dev/semrush";
const OPR_ENDPOINT = "https://openpagerank.com/api/v1.0/getPageRank";

function jsonResponseWith(cors: Record<string, string>) {
  return (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
}

function isAdminEmail(email: string | undefined | null, adminEmails: string[]) {
  if (!email) return false;
  return adminEmails.includes(email.trim().toLowerCase());
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseSemrushBacklinksOverview(json: unknown) {
  const data = (json as Record<string, unknown>)?.data;
  const columns = Array.isArray(data?.columnNames) ? data.columnNames as string[] : [];
  const rows = Array.isArray(data?.rows) ? data.rows as unknown[] : [];

  if (columns.length === 0 || rows.length === 0) {
    return null;
  }

  const idx = (name: string) => columns.findIndex((c) => c.toLowerCase() === name.toLowerCase());

  const asIdx = idx("ascore");
  const trustIdx = idx("trust_score");
  const totalIdx = idx("total");
  const domainsIdx = idx("domains_num");
  const followIdx = idx("follows_num");
  const nofollowIdx = idx("nofollows_num");

  const row = rows[0] as (string | number | null)[];

  return {
    authority_score: normalizeNumber(row[asIdx]),
    trust_score: normalizeNumber(row[trustIdx]),
    backlinks_total: normalizeNumber(row[totalIdx]),
    referring_domains: normalizeNumber(row[domainsIdx]),
    follow_links: normalizeNumber(row[followIdx]),
    nofollow_links: normalizeNumber(row[nofollowIdx]),
  };
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const jsonResponse = jsonResponseWith(corsHeaders);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Auth: admin user OR scheduled cron job (shared secret header)
    const cronSecret = Deno.env.get("BACKLINK_CRON_SECRET");
    const providedCronSecret = req.headers.get("x-cron-secret");
    const isCron = Boolean(cronSecret && providedCronSecret === cronSecret);

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const { data: userData } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };
    const callerEmail = userData?.user?.email?.toLowerCase();
    const adminEmails = (Deno.env.get("ADMIN_EMAILS") || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!isCron && !isAdminEmail(callerEmail, adminEmails)) {
      return jsonResponse({ error: "Neautorizat" }, 403);
    }

    // Cron callers may only trigger the live refresh.
    if (
      isCron && !isAdminEmail(callerEmail, adminEmails) &&
      action !== "fetch_live" && action !== "fetch_free"
    ) {
      return jsonResponse({ error: "Acțiune nepermisă pentru job programat" }, 403);
    }

    // Record every refresh attempt — including failures — so the dashboard can
    // tell "the API isn't available on this plan" apart from "the weekly job
    // stopped running". Logging must never break the request it describes.
    const logAttempt = async (
      outcome: "success" | "not_configured" | "api_unavailable" | "parse_error" | "error",
      opts: { provider?: "semrush" | "open_pagerank"; httpStatus?: number; detail?: string } = {},
    ) => {
      try {
        await supabase.from("backlink_fetch_attempts").insert({
          domain: TARGET_DOMAIN,
          trigger_source: isCron ? "cron" : "manual",
          provider: opts.provider ?? "semrush",
          outcome,
          http_status: opts.httpStatus ?? null,
          detail: opts.detail ? String(opts.detail).slice(0, 1000) : null,
        });
      } catch (e) {
        console.error("backlink attempt log failed", e);
      }
    };

    if (action === "attempts") {
      const { data, error } = await supabase
        .from("backlink_fetch_attempts")
        .select("*")
        .eq("domain", TARGET_DOMAIN)
        .order("attempted_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("backlink_snapshots")
        .select("*")
        .eq("domain", TARGET_DOMAIN)
        .order("snapshot_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return jsonResponse({ data });
    }

    if (action === "delete") {
      const { id } = body;
      if (typeof id !== "string") {
        return jsonResponse({ error: "ID invalid" }, 400);
      }
      const { error } = await supabase
        .from("backlink_snapshots")
        .delete()
        .eq("id", id)
        .eq("domain", TARGET_DOMAIN);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "fetch_live") {
      // Semrush (necesită plan plătit cu Backlinks API)
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      const semrushApiKey = Deno.env.get("SEMRUSH_API_KEY");

      if (!lovableApiKey || !semrushApiKey) {
        await logAttempt("not_configured", {
          detail: "Semrush connection keys are not configured",
        });
        return jsonResponse(
          {
            error: "Conexiunea Semrush nu este configurată",
            details:
              "Conectează contul Semrush din panoul Lovable (Connectors → Semrush) pentru a importa date live.",
          },
          422,
        );
      }

      const url = `${GATEWAY_BASE}/backlinks/backlinks_overview?target=${encodeURIComponent(
        TARGET_DOMAIN,
      )}&target_type=root_domain`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "X-Connection-Api-Key": semrushApiKey,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        // No snapshot is written here: the last successful snapshot stays
        // untouched and is still what the dashboard shows.
        await logAttempt("api_unavailable", { httpStatus: response.status, detail: text });
        return jsonResponse(
          {
            error: "Cererea Semrush a eșuat",
            status: response.status,
            details: text,
          },
          response.status,
        );
      }

      const semrushData = await response.json();
      const overview = parseSemrushBacklinksOverview(semrushData);

      if (!overview) {
        await logAttempt("parse_error", {
          httpStatus: response.status,
          detail: JSON.stringify(semrushData),
        });
        return jsonResponse(
          {
            error: "Nu am putut extrage datele din răspunsul Semrush",
            raw: semrushData,
          },
          422,
        );
      }

      const snapshot = {
        snapshot_date: new Date().toISOString().slice(0, 10),
        domain: TARGET_DOMAIN,
        ...overview,
        top_referring_domains: [],
        anchor_distribution: [],
        source: "semrush",
        metric_sources: {
          authority_score: "semrush",
          trust_score: "semrush",
          backlinks_total: "semrush",
          referring_domains: "semrush",
          follow_links: "semrush",
          nofollow_links: "semrush",
        },
      };

      const { data, error } = await supabase
        .from("backlink_snapshots")
        .upsert(snapshot, { onConflict: "domain,snapshot_date" })
        .select()
        .single();

      if (error) throw error;
      await logAttempt("success", { httpStatus: response.status });
      return jsonResponse({ data });
    }

    if (action === "fetch_free") {
      const oprKey = Deno.env.get("OPEN_PAGERANK_API_KEY");
      if (!oprKey) {
        await logAttempt("not_configured", {
          provider: "open_pagerank",
          detail: "OPEN_PAGERANK_API_KEY is not set",
        });
        return jsonResponse(
          {
            error: "Sursa gratuită nu este configurată",
            details:
              "Adaugă cheia gratuită Open PageRank (OPEN_PAGERANK_API_KEY) pentru actualizarea automată.",
          },
          422,
        );
      }

      const url = `${OPR_ENDPOINT}?domains%5B0%5D=${encodeURIComponent(TARGET_DOMAIN)}`;
      const response = await fetch(url, { headers: { "API-OPR": oprKey } });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Open PageRank request failed [${response.status}]: ${text}`);
        await logAttempt("api_unavailable", {
          provider: "open_pagerank",
          httpStatus: response.status,
          detail: text,
        });
        return jsonResponse(
          { error: "Cererea Open PageRank a eșuat", status: response.status, details: text },
          response.status,
        );
      }

      const oprJson = await response.json() as {
        response?: Array<{ status_code?: number; page_rank_decimal?: number | string; rank?: string | null }>;
      };
      const entry = oprJson.response?.[0];
      const decimal = normalizeNumber(entry?.page_rank_decimal);

      if (!entry || entry.status_code !== 200 || decimal === null) {
        await logAttempt("parse_error", {
          provider: "open_pagerank",
          detail: JSON.stringify(oprJson),
        });
        return jsonResponse(
          { error: "Nu am putut extrage scorul Open PageRank", raw: oprJson },
          422,
        );
      }

      // Open PageRank este 0–10; îl convertim la scala 0–100 folosită în dashboard.
      const authority = Math.round(decimal * 10);
      const snapshotDate = new Date().toISOString().slice(0, 10);

      // Păstrăm ultimele valori cunoscute pentru metricile pe care sursa gratuită nu le oferă.
      const { data: previous } = await supabase
        .from("backlink_snapshots")
        .select("*")
        .eq("domain", TARGET_DOMAIN)
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      const prevSources = (previous?.metric_sources ?? {}) as Record<string, string>;
      const carried = (key: string) => prevSources[key] ?? (previous ? "manual" : "unknown");

      const snapshot = {
        snapshot_date: snapshotDate,
        domain: TARGET_DOMAIN,
        authority_score: authority,
        trust_score: previous?.trust_score ?? null,
        backlinks_total: previous?.backlinks_total ?? null,
        referring_domains: previous?.referring_domains ?? null,
        follow_links: previous?.follow_links ?? null,
        nofollow_links: previous?.nofollow_links ?? null,
        top_referring_domains: previous?.top_referring_domains ?? [],
        anchor_distribution: previous?.anchor_distribution ?? [],
        source: "open_pagerank",
        metric_sources: {
          authority_score: "open_pagerank",
          trust_score: carried("trust_score"),
          backlinks_total: carried("backlinks_total"),
          referring_domains: carried("referring_domains"),
          follow_links: carried("follow_links"),
          nofollow_links: carried("nofollow_links"),
        },
      };

      const { data, error } = await supabase
        .from("backlink_snapshots")
        .upsert(snapshot, { onConflict: "domain,snapshot_date" })
        .select()
        .single();

      if (error) throw error;
      await logAttempt("success", { provider: "open_pagerank", httpStatus: response.status });
      return jsonResponse({ data });
    }

    if (action === "upsert_manual") {
      const {
        snapshot_date,
        authority_score,
        trust_score,
        backlinks_total,
        referring_domains,
        follow_links,
        nofollow_links,
        top_referring_domains,
        anchor_distribution,
        source,
        metric_sources,
      } = body;

      if (typeof snapshot_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot_date)) {
        return jsonResponse({ error: "Data snapshot-ului trebuie să fie YYYY-MM-DD" }, 400);
      }

      const snapshot = {
        snapshot_date,
        domain: TARGET_DOMAIN,
        authority_score: normalizeNumber(authority_score),
        trust_score: normalizeNumber(trust_score),
        backlinks_total: normalizeNumber(backlinks_total),
        referring_domains: normalizeNumber(referring_domains),
        follow_links: normalizeNumber(follow_links),
        nofollow_links: normalizeNumber(nofollow_links),
        top_referring_domains: Array.isArray(top_referring_domains) ? top_referring_domains : [],
        anchor_distribution: Array.isArray(anchor_distribution) ? anchor_distribution : [],
        source: source === "gsc_csv" ? "gsc_csv" : "manual",
        metric_sources: metric_sources && typeof metric_sources === "object" ? metric_sources : {},
      };

      const { data, error } = await supabase
        .from("backlink_snapshots")
        .upsert(snapshot, { onConflict: "domain,snapshot_date" })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ data });
    }

    return jsonResponse({ error: "Acțiune necunoscută" }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("backlink-snapshot error:", message);
    return jsonResponse({ error: "Eroare internă", details: message }, 500);
  }
});
