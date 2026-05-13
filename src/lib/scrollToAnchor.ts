/**
 * Smoothly scroll to an in-page anchor by id or "#id" hash.
 * Returns true when the target element was found and scrolled to.
 */
export function scrollToAnchor(target: string, options?: { updateHash?: boolean }): boolean {
  const id = target.replace(/^#/, "");
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth" });
  if (options?.updateHash) {
    history.replaceState(null, "", `#${id}`);
  }
  return true;
}

/**
 * Scroll after the next paint — useful when the target element is about to
 * mount (e.g. just navigated to a route that renders it).
 */
export function scrollToAnchorWhenReady(target: string, delayMs = 80): void {
  setTimeout(() => {
    scrollToAnchor(target);
  }, delayMs);
}