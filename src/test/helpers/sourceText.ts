/**
 * Helpers for tests that read source files as text.
 *
 * Those tests pin a piece of code ("the webhook still checks X before Y"), not
 * its layout. Prettier is free to re-wrap a call, add a trailing comma, swap
 * quotes or put parentheses around a lone arrow parameter; none of that changes
 * what the code does, so none of it should fail a test.
 */

/**
 * The code with formatting removed: no whitespace, no trailing commas, one
 * quote style, `(x) =>` written as `x =>`. Compare a needle the same way:
 * `expect(code(src)).toContain(code("a(b, c)"))`.
 */
export function code(source: string): string {
  return source
    .replace(/\s+/g, "")
    .replace(/,(?=[)\]}>])/g, "")
    .replace(/'/g, '"')
    .replace(/\(([A-Za-z_$][\w$]*)\)=>/g, "$1=>");
}

/**
 * The code on one line with single spaces, without trailing commas: a
 * multi-line object literal reads as `{ path: "/x", noindex: true }` again.
 */
export function flat(source: string): string {
  return source
    .replace(/\s+/g, " ")
    .replace(/,\s*(?=[)\]}])/g, " ")
    .replace(/([({[])\s+/g, "$1 ")
    .replace(/\s+([)\]}])/g, " $1");
}

/**
 * Every object literal in `source` that starts with `{ <key>:`, flattened.
 * Lets a test walk a table such as the SEO route list whether each entry sits
 * on one line or Prettier has spread it over several.
 */
export function objectLiterals(source: string, key: string): string[] {
  const out: string[] = [];
  const start = new RegExp(`\\{\\s*${key}\\s*:`, "g");
  let m: RegExpExecArray | null;
  while ((m = start.exec(source))) {
    let depth = 0;
    let quote: string | null = null;
    for (let i = m.index; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") quote = ch;
      else if (ch === "{") depth++;
      else if (ch === "}" && --depth === 0) {
        out.push(flat(source.slice(m.index, i + 1)));
        start.lastIndex = i + 1;
        break;
      }
    }
  }
  return out;
}
