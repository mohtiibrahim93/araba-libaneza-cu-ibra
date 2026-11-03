import { useEffect, useMemo, useState } from "react";

/**
 * Admin lists, a page at a time (audit P3: the lists had no pagination and
 * rendered every row ever recorded). Goes back to page 1 when the list
 * changes (a new filter or search), so a filter never lands on an empty page.
 */
export function usePaged<T>(rows: T[], size = 50) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  useEffect(() => {
    setPage(1);
  }, [rows]);
  const current = Math.min(page, pages);
  const pageRows = useMemo(
    () => rows.slice((current - 1) * size, current * size),
    [rows, current, size],
  );
  return {
    page: current,
    pages,
    setPage,
    pageRows,
    from: rows.length === 0 ? 0 : (current - 1) * size + 1,
    to: Math.min(rows.length, current * size),
    total: rows.length,
  };
}

export function Pager({
  page,
  pages,
  setPage,
  from,
  to,
  total,
}: {
  page: number;
  pages: number;
  setPage: (p: number) => void;
  from: number;
  to: number;
  total: number;
}) {
  if (pages <= 1) return null;
  const btn =
    "inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-medium disabled:opacity-40";
  return (
    <nav
      aria-label="Paginare"
      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm text-muted-foreground"
    >
      <span>
        {from}–{to} din {total}
      </span>
      <span className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          ← Înapoi
        </button>
        <span aria-current="page">
          Pagina {page} din {pages}
        </span>
        <button
          type="button"
          className={btn}
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Înainte →
        </button>
      </span>
    </nav>
  );
}
