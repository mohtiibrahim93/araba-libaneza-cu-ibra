import { lazy, type ComponentType } from "react";

const RELOAD_FLAG = "chunk-reload-attempted";

/**
 * React.lazy wrapper that survives stale deployments.
 *
 * After a new build ships, the HTML a user already has open points at chunk
 * filenames that no longer exist -> the dynamic import rejects with
 * "Importing a module script failed." / "Failed to fetch dynamically imported
 * module" and the app renders a blank screen.
 *
 * Strategy: retry the import once (covers transient network blips); if it still
 * fails, force a one-time hard reload so the browser fetches fresh index.html
 * with the new chunk hashes.
 *
 * The whole recovery path is browser-only. During the build-time prerender
 * there is no sessionStorage and no page to reload, so the storage access is
 * guarded — an unguarded call threw before the first component could render,
 * which meant no route could be prerendered at all.
 */
/** sessionStorage, or a no-op stand-in when there is no browser (SSR/prerender). */
function safeStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  try {
    if (typeof sessionStorage !== "undefined") return sessionStorage;
  } catch {
    // Access itself throws in some privacy modes — fall through to the no-op.
  }
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    const store = safeStorage();
    try {
      const mod = await factory();
      store.removeItem(RELOAD_FLAG);
      return mod;
    } catch (err) {
      try {
        const mod = await factory();
        store.removeItem(RELOAD_FLAG);
        return mod;
      } catch (err2) {
        if (typeof window !== "undefined" && store.getItem(RELOAD_FLAG) !== "1") {
          store.setItem(RELOAD_FLAG, "1");
          window.location.reload();
          // Never resolves; the page is going away.
          return new Promise<{ default: T }>(() => {});
        }
        throw err2;
      }
    }
  });
}
