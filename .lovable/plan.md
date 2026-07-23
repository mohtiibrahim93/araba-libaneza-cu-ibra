# SEO Backlog — Corrected & Complete

You caught me — the first pass missed several recommendations. I went back through every SEO/Semrush exchange (messages #930–#1131) and pulled the full list of things that were proposed but never shipped.

## What was already done (for context)

Built and live: 5 RO landing pages (`/cursuri-limba-araba`, `/meditatii-araba`, `/invata-araba`, `/cursuri-araba-bucuresti`, `/curs-araba-copii`), 5 EN pages (`/en/learn-lebanese-arabic`, `/en/learn-levantine-arabic`, `/en/arabic-tutor`, `/en/arabic-classes-near-me`, `/en/arabic-dialects-guide`, `/en/lebanese-arabic-vs-msa-vs-egyptian`, `/en/how-to-learn-lebanese-arabic`), 3 blog posts (Arabic vs MSA, Learn Lebanese Arabic, Grammar), FAQ expansions (identity + grammar), `LocalBusiness` schema on Bucuresti page, `disavow.txt` generated, per-route Helmet on all main pages.

## 1. Manual actions (0 credits — only you can do these)

- **Upload `public/disavow.txt`** to Google Search Console → Disavow links tool. File lists 13 spam PBN domains. Without this upload, Google still counts them.
- **9 Stripe DNS records** at domain provider (branded checkout domain — pending).
- **3 Stripe webhook events** in Stripe Dashboard: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.
- **GA4 → Reports → Retention** to see new vs returning split.

## 2. Content still not built (was proposed, never shipped)

| # | Item | Source msg | Est. credits |
|---|------|------------|--------------|
| A | **`/de/arabisch-lernen`** German landing page | 3,600/mo, DE = #1 traffic country | 3–4 |
| B | **Phrases blog cluster**: `/blog/lebanese-arabic-phrases`, `/blog/lebanese-greetings`, `/blog/lebanese-family-vocabulary` | Counter to thespokenarabic.com | 4–5 |
| C | **RO city pages**: `/cursuri-araba-cluj`, `/cursuri-araba-brasov`, `/cursuri-araba-timisoara` | Counter to Centrul Unirea | 3–4 |
| D | **RO homepage optimization for `cursuri araba`** — new `<title>`, `<h1>`, meta desc. Currently ranked position 32 (page 4). This term is 320/mo, KD 20 — you already rank; a proper on-page fix could push you to page 1. | msg #1081 | 1–2 |
| E | **New blog post**: "De ce araba este una dintre cele mai rapid crescânde limbi în 2026" (RO + EN) — broad discovery + inbound links | msg #1073 | 2–3 |
| F | **Stats-driven trust section** on `/en/learn-lebanese-arabic` (30M+ speakers, 5th most-learned, dialect-over-MSA shift) | msg #1073 | 1 |
| G | **English homepage hero refresh** — lead with practical/conversational Lebanese instead of generic "learn Arabic" | msg #1073 | 1 |
| H | **Trust signals on `/en/arabic-tutor`** — "top 5 language on Preply" + testimonial callouts | msg #1073 | 1 |
| I | **`/cursuri/grup/a1` meta/H1** fix for "curs araba incepatori bucuresti" — page gets 11 views with zero optimization | 1 |

## 3. Data / infra we discussed but didn't run

- **Semrush connector** — multi-year trend data on Levantine/Lebanese/Arabic dialects. You said "let's see"; still not connected. 1 credit for me to trigger the modal.

## Recommended spend for ~10–15 credit budget

Two options:

**Option 1 — "Biggest gaps" (≈11 credits):** A + B + D + I
Covers the untapped German market, the EN long-tail moat, the RO homepage fix (fastest ranking win), and the A1 page.

**Option 2 — "Quick wins only" (≈7 credits):** D + F + G + H + I + E
Skips the two big builds (A & B), but ships 6 small high-ROI improvements to existing pages. Better if you'd rather polish what's ranking than build new pages.

Reply with **Option 1**, **Option 2**, or your own letter picks (e.g. "A + D + I"), and I'll ship them in one build pass.
