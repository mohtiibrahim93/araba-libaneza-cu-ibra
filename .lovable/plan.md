# Plan: Backlink Health Analysis + Tracking Dashboard

## Context

- centruldearabalibaneza.com has a spammy backlink profile (27 links from 24 low-quality/PBN-style domains).
- A `public/disavow.txt` file exists and was already uploaded to Google Search Console.
- Google Search Console disavow only affects Google's ranking calculations; Semrush and other crawlers will continue to display the raw links.
- No Semrush workspace connection is currently linked to the project (Google Search Console is linked, but Semrush is not).

## Phase 1: Analysis & Strategy

1. Document the current backlink profile baseline using Semrush data already gathered.
2. Explain the disavow limitation to the user in plain terms.
3. Produce a tailored backlink-acquisition strategy for a Lebanese Arabic course site, including:
   - Target directories / communities (language-learning forums, expat groups, Romanian education blogs, Lebanese diaspora sites).
   - Content assets worth linking to (the grammar guides, dialect maps, and phrase lists already published).
   - Outreach templates and a realistic 90-day action plan.

## Phase 2: Backlink Health Dashboard

Build a lightweight admin dashboard so the user can track backlink health over time without manually re-running Semrush reports.

### Database

- Create `public.backlink_snapshots` table:
  - `id uuid primary key`
  - `snapshot_date date not null`
  - `domain text not null`
  - `authority_score integer`
  - `trust_score integer`
  - `backlinks_total integer`
  - `referring_domains integer`
  - `follow_links integer`
  - `nofollow_links integer`
  - `top_referring_domains jsonb`
  - `anchor_distribution jsonb`
  - `created_at timestamp with time zone`
- Add standard GRANTs, RLS, and a policy restricting reads to authenticated admin users.

### Edge Function

- Create `supabase/functions/backlink-snapshot/index.ts`:
  - Reuse the existing admin auth pattern (JWT + `ADMIN_EMAILS` allowlist).
  - Call the Semrush connector gateway (`/backlinks/backlinks_overview`) for `centruldearabalibaneza.com`.
  - Upsert a row into `backlink_snapshots`.
  - Return the snapshot data to the caller.
  - Surface quota-exceeded errors with a clear message.

### Connector Dependency

- The project currently has no Semrush connection.
- Before the edge function can fetch live data, the user must connect Semrush via `standard_connectors--connect`.
- Fallback: support manual CSV upload from a Semrush Backlinks Analytics export until the connector is linked.

### Admin UI

- Add a new "SEO / Backlinks" tab in `/admin`.
- Build `src/components/admin/BacklinksAdmin.tsx`:
  - "Refresh snapshot" button (calls the edge function; disabled if Semrush is not connected and no manual CSV is uploaded).
  - Summary cards: Authority Score, Trust Score, Total Backlinks, Referring Domains, Follow/Nofollow ratio.
  - Trend chart using the historical snapshot rows.
  - Table of top referring domains with follow/nofollow flags.
  - Manual CSV import area for the fallback path.

### Security & Access

- Restrict the new edge function and table to admin users only, matching the existing `admin-registrations` pattern.
- Do not expose Semrush credentials or raw gateway keys to the browser.

## Deliverables

1. Written backlink strategy document (shared in chat).
2. `backlink_snapshots` table migration.
3. `backlink-snapshot` edge function deployed.
4. `BacklinksAdmin` component wired into the admin tabs.
5. Instructions for connecting Semrush or uploading a CSV fallback.

## Open Decision

- Should the dashboard pull live Semrush data (requires connecting the Semrush connector), or should we start with the manual CSV fallback and add live fetching after the connector is linked?
