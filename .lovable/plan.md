# SEO Backlog — What's Still Open

Recap of every recommendation raised in our recent SEO/Semrush conversations that has **not** been actioned yet, grouped by priority and rough credit cost so you can pick what to spend on.

## 1. Manual actions (0 credits — you do these, not me)

These need your login to third-party dashboards; I can't do them for you.

- **Upload the disavow file to Google Search Console.**
  File is already generated at `public/disavow.txt` (13 spam domains: 8coint.com, cindylaup.com, toplikevideo.com, analyticshaven.top, atomizelink.icu, etc.).
  → Search Console → https://search.google.com/search-console/disavow-links → pick the property → upload the file.
- **Add the 9 Stripe DNS records** at your domain provider (from earlier message) — still pending, blocks branded Stripe checkout domain.
- **Add Stripe webhook events** `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted` in Stripe Dashboard — still pending, blocks subscription lifecycle updates.
- **Check GA4 New vs Returning** in analytics.google.com (Reports → Retention) — informational only.

## 2. High-ROI content still not built

Ranked by search volume vs effort.

| # | Item | Volume / Reason | Est. credits |
|---|------|-----------------|--------------|
| A | `/de/arabisch-lernen` German landing page | 3,600/mo, DE is your #1 traffic country (88 visitors) with zero targeted page | 3–4 |
| B | Phrases blog cluster: `/blog/lebanese-arabic-phrases`, `/blog/lebanese-greetings`, `/blog/lebanese-family-vocabulary` | Direct counter to thespokenarabic.com (EN leader) | 4–5 (all three in one pass) |
| C | RO city pages: `/cursuri-araba-cluj`, `/cursuri-araba-brasov`, `/cursuri-araba-timisoara` | Counter to Centrul Unirea's local moat; you already teach online | 3–4 (all three) |
| D | Optimize `/cursuri/grup/a1` meta/H1 for "curs araba incepatori bucuresti" | Already getting 11 views with zero optimization — quick win | 1 |

## 3. Data pulls we discussed but didn't run

- **Semrush connector** for multi-year trend data on "Levantine Arabic", "Lebanese Arabic", "Arabic dialects", identity terms. You said "let's see" — still not connected. Requires you to authorize; ~1 credit for me to trigger the modal.

## Recommended spend for your ~10–15 credit budget

Best value stack (≈11 credits, covers the biggest gaps):

1. **A — German page** (3–4 cr) — biggest untapped market
2. **B — Phrases blog cluster** (4–5 cr) — long-tail EN moat
3. **D — A1 page meta fix** (1 cr) — cheap win on a page already getting traffic
4. Leave city pages (C) and Semrush connector for later

Reply with the letters you want (e.g. "do A + B + D") and I'll ship them in one pass. Manual actions in section 1 are on you regardless — none of them cost credits but all are blocking.
