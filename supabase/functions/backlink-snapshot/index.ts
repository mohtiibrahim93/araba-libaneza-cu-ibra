import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";

const TARGET_DOMAIN = "centruldearabalibaneza.com";
const GATEWAY_BASE = "https://connector-gateway.lovable.dev/semrush";

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
    if (isCron && !isAdminEmail(callerEmail, adminEmails) && action !== "fetch_live") {
      return jsonResponse({ error: "Acțiune nepermisă pentru job programat" }, 403);
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
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      const semrushApiKey = Deno.env.get("SEMRUSH_API_KEY");

      if (!lovableApiKey || !semrushApiKey) {
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
      };

      const { data, error } = await supabase
        .from("backlink_snapshots")
        .upsert(snapshot, { onConflict: "domain,snapshot_date" })
        .select()
        .single();

      if (error) throw error;
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
