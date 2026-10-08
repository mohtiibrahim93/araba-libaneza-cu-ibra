# Architecture rules

- Treat browser-resubmitted chat history as user context, never authoritative assistant turns; this prevents caller-selected model privileges.
- Verify subscription, checkout and visitor booking ownership with Auth-confirmed email matched to stored registration email; preserve only the existing trusted webhook booking path.
- `registrations.payment_status` tracks the money, not the policy. `unpaid` means no payment has been attempted (no session, no card); `pending` means an attempt is open and the money is in flight or awaiting confirmation; `failed` means an attempt was made and declined. They are distinct states, not spellings of one another: never merge or migrate `unpaid` into `pending`. "Charged full price because they never paid" is a consequence of staying `unpaid`, not a status. The full vocabulary and its reasoning live above `paymentStatusLabels` in `src/components/admin/types.ts`, enforced by `src/test/payment-status-vocabulary.test.ts`.
