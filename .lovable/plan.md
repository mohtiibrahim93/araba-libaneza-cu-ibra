# Fix language toggle re-render

## Root cause

`I18nProvider` is wired correctly in isolation, but it's mounted **per page** (`Index`, `Booking`, `BookingManage`, `Privacy`, `Terms`). That causes three real problems:

1. Each route has its own independent `lang` state. Switching language on one page does not affect a sibling tree (e.g. a future modal/portal rendered outside the page).
2. The context value object is recreated every render with no `useMemo`, so any consumer that ever gets wrapped in `React.memo` (or any portal that re-parents) can miss updates.
3. Switching language in one tab / window doesn't sync — and if anything ever reads `localStorage` directly, it gets stale data.

## Plan

### 1. `src/lib/i18n.tsx` — harden the provider
- Memoize the context value with `useMemo(() => ({ lang, t: translations[lang], toggle, setLang }), [lang])`.
- Wrap `setLang` / `toggle` in `useCallback` so identity is stable.
- Add a `storage` event listener so changes in another tab (or programmatic writes) propagate.
- Set `document.documentElement.lang` inside the provider's `useEffect` so it always reflects current locale, regardless of which page mounted.

### 2. `src/App.tsx` — single provider at the root
- Wrap the whole `<BrowserRouter>` subtree in `<I18nProvider>` once.
- Pages keep using `useI18n()` unchanged.

### 3. Remove per-page providers
- `src/pages/Index.tsx`, `src/pages/Booking.tsx`, `src/pages/BookingManage.tsx`, `src/pages/Privacy.tsx`, `src/pages/Terms.tsx`: drop the `<I18nProvider>` wrapper, keep `useI18n` imports.
- `src/components/Navbar.test.tsx`: keep its local provider (tests need isolation).

### 4. Verify
- Manually toggle RO ⇄ EN on `/`, confirm Hero/Programs/Pricing/Footer all flip.
- Toggle on `/booking` and `/booking/manage/:token`, confirm scheduler labels flip.
- Refresh → language persists from `localStorage`.
- Open two tabs, change language in one, confirm the other updates (storage event).

## Notes
- No translation strings change.
- No API/DB changes.
- Behavior preserved: default `ro`, persisted to `localStorage["site-language"]`.
