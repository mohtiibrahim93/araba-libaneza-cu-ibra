import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Whether a scroll box has more to the right, and whether you are already there.
 *
 * The admin panel's wide tables scroll sideways inside their own box, which is
 * the right behaviour and was invisible. At the minimum widths the columns
 * declare — Înscrieri alone asks for about 980px — a 360px phone shows the
 * first third of a row and gives no sign there is a second and a third. The
 * columns were never hidden; nothing said they were there.
 *
 * So this measures the box and its content, and the two tables built on it
 * answer with a fade at the edge and a focusable labelled region. A keyboard
 * or screen-reader user cannot scroll an unfocusable div at all, so that half
 * is not decoration.
 *
 * `atEnd` exists so the fade disappears once there is nothing left to reveal,
 * rather than sitting over the last column forever and reading as a gradient
 * someone designed on purpose.
 */
export function useHorizontalOverflow<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [overflows, setOverflows] = useState(false);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // A pixel of slack: sub-pixel layout rounding otherwise reports a table
    // that fits exactly as one that overflows, on every resize.
    const slack = 1;
    const more = el.scrollWidth - el.clientWidth > slack;
    setOverflows(more);
    setAtEnd(!more || el.scrollLeft + el.clientWidth >= el.scrollWidth - slack);
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    // ResizeObserver is absent in jsdom and in older Safari. Without it the
    // first measurement still stands, which covers the common case of a table
    // that is rendered once and read.
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // The content too: rows arriving after the fetch change scrollWidth
    // without changing the box.
    const content = el.firstElementChild;
    if (content) ro.observe(content);
    return () => ro.disconnect();
  }, [measure]);

  return { ref, overflows, atEnd, measure };
}

/**
 * The attributes that make an overflowing scroll box reachable without a mouse.
 *
 * Applied only while it overflows: a tab stop on a table that fits is one more
 * thing to tab past for no gain.
 */
export function scrollRegionProps(overflows: boolean, label?: string) {
  if (!overflows) return {};
  return {
    role: "region",
    tabIndex: 0,
    "aria-label": label ? `${label} (derulează lateral)` : "Tabel, derulează lateral",
  } as const;
}
