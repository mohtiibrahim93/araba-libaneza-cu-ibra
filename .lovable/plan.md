# Custom domain email: contact@centruldearabalibaneza.com

## Goal
- Show `contact@centruldearabalibaneza.com` as the contact address on the site (RO + EN).
- Send all app emails (auth + transactional) from this domain.
- Receive mail sent to `contact@…` either in a real mailbox or, if not possible inside Lovable, via forwarding to a personal inbox.

## What Lovable can and cannot do
- **Send (outbound):** fully supported. Lovable provisions a delegated sender subdomain (e.g. `notify.centruldearabalibaneza.com`) with SPF/DKIM, and the visible From can be set to `contact@centruldearabalibaneza.com` (root display).
- **Receive (inbound):** Lovable does **not** host mailboxes and does **not** run an inbound mail server. There is no native "forward inbound" feature.
- Since the domain was bought through Lovable, registrar DNS records (MX/TXT) can be edited from **Project Settings → Domains → Configure → Manage DNS records**, which lets us point inbound mail to a third-party mailbox or forwarding provider.

## Plan

### 1. Update displayed contact on the site
- Replace `mohtiibrahim@gmail.com` with `contact@centruldearabalibaneza.com` everywhere it appears in the UI (RO + EN):
  - `src/components/CTASection.tsx` (Email card)
  - `src/components/Footer.tsx` (if present)
  - any i18n strings in `src/lib/i18n.tsx` (e.g. `ctaEmailValue`, footer email, etc.)
  - any `mailto:` links
- Keep the existing Gmail address out of user-facing copy; it can remain only in internal admin notification recipients if needed.

### 2. Set up the Lovable email domain
- Open the email setup dialog so the user can configure `centruldearabalibaneza.com` as the sender domain:
  
  ```
  <presentation-actions>
  <presentation-open-email-setup>Set up email domain</presentation-open-email-setup>
  </presentation-actions>
  ```
- Lovable will delegate a subdomain (e.g. `notify.centruldearabalibaneza.com`) and provision SPF/DKIM. The visible From can be `contact@centruldearabalibaneza.com`.
- After domain is set, run `email_domain--setup_email_infra` (queues, cron, send log, suppression, unsubscribe tokens).

### 3. Wire transactional sends from contact@
- Call `email_domain--scaffold_transactional_email` to create `send-transactional-email`, `handle-email-unsubscribe`, and a sample template.
- Confirm the scaffolded From is `contact@centruldearabalibaneza.com` (root display) with `SENDER_DOMAIN` pointing at the delegated subdomain.
- Existing send call sites (registration confirmation, booking, trial follow-up, admin notify) keep working without code changes once the domain switches.

### 4. Optional: branded auth emails
- If wanted in the same pass, scaffold auth templates with `email_domain--scaffold_auth_email_templates` and deploy `auth-email-hook` so confirmation / magic-link / reset emails also come from `contact@centruldearabalibaneza.com`.

### 5. Inbound mail to contact@ — pick one
Since Lovable cannot receive mail, choose how replies to `contact@centruldearabalibaneza.com` are delivered. **This requires one external decision from the user**, and we'd add the resulting MX/TXT records via *Project Settings → Domains → Manage DNS records*:

- **Option A — Real mailbox (recommended):** create a `contact@` mailbox with Google Workspace (~6 €/user/month) or Zoho Mail (free tier available). We add their MX records to the root domain. Best deliverability, real inbox, can also reply *from* `contact@`.
- **Option B — Free forwarding only:** use ImprovMX or Forward Email (both free). We add their MX records; any mail to `contact@centruldearabalibaneza.com` is forwarded to the personal Gmail. Replies still go out from Gmail unless paired with Workspace.
- **Option C — Skip inbound for now:** site shows `contact@…` only as a display address; mail sent to it bounces until A or B is configured.

We will not pick this automatically — the user confirms A, B, or C, then we add the MX records through the Lovable DNS manager.

### 6. QA
- Verify the contact cards in RO and EN show the new address and the `mailto:` opens to it.
- Send a test transactional email and confirm the From header is `contact@centruldearabalibaneza.com`.
- If Option A/B is chosen, send a test message to `contact@…` and confirm delivery to the destination inbox.

## Out of scope
- Building a custom in-app inbox / IMAP UI.
- Bulk/marketing email (not supported in Lovable; would need a dedicated provider).
- Migrating existing Gmail history.
