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
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem(RELOAD_FLAG);
      return mod;
    } catch (err) {
      try {
        const mod = await factory();
        sessionStorage.removeItem(RELOAD_FLAG);
        return mod;
      } catch (err2) {
        if (sessionStorage.getItem(RELOAD_FLAG) !== "1") {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          window.location.reload();
          // Never resolves; the page is going away.
          return new Promise<{ default: T }>(() => {});
        }
        throw err2;
      }
    }
  });
}
