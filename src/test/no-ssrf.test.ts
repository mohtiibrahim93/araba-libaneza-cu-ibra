import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { code } from "./helpers/sourceText";

/**
 * Server-side request forgery guard (owner's request, 13 October 2026).
 *
 * Audit result that day: no server request takes its address from a user.
 * Every fetch in the edge functions and the site's server code goes to a
 * fixed host: Lovable's connector gateway (Google Calendar, Semrush), Stripe,
 * Google reCAPTCHA, Open PageRank, Lovable's AI gateway, or the project's own
 * functions. Event ids and tokens appear only in the path, never the host.
 *
 * This test keeps it that way: each server request must start from a fixed
 * https host, either written in place or held in a constant that is. A new
 * feature that opens a link the user typed (a link preview, "import from
 * URL") fails here, and needs an explicit allow-list and a private-address
 * check before it can be added to the exceptions below.
 */

const root = process.cwd();
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

const serverFiles = [
  ...walk(resolve(root, "supabase/functions")),
  ...walk(resolve(root, "src/routes")).filter((f) => /\.ts$/.test(f)),
  ...walk(resolve(root, "src/lib")).filter((f) => f.endsWith(".server.ts")),
  ...walk(resolve(root, "src/integrations")).filter((f) =>
    f.endsWith(".server.ts"),
  ),
];

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

/** Hosts written in place: an https literal whose host contains no interpolation. */
const FIXED_LITERAL = /^["'`]https:\/\/[a-z0-9.-]+\//i;
/** Constants already proven fixed (checked below) and the project's own URL. */
const FIXED_PREFIX =
  /^`\$\{(GCAL_GATEWAY|GATEWAY|GATEWAY_BASE|Deno\.env\.get\("SUPABASE_URL"\))\}\//;

/** Explicit, reviewed exceptions: [file suffix, argument, why]. */
const REVIEWED: Array<[string, string, string]> = [
  [
    "src/lib/ai-gateway.server.ts",
    "input",
    "wraps the AI SDK's own fetch; the SDK's base URL is fixed in src/routes/api/chat.ts",
  ],
  [
    "src/integrations/supabase/client.server.ts",
    "input",
    "wraps supabase-js's own fetch; its base URL is the SUPABASE_URL setting",
  ],
];

export function badRequests(file: string, source: string): string[] {
  const s = stripComments(source);
  const bad: string[] = [];
  const call = file.includes("calendar-reconciliation")
    ? /(?<![\w.])(fetch|request)\(\s*/g
    : /(?<![\w.])fetch\(\s*/g;
  for (const m of s.matchAll(call)) {
    const arg = s.slice(m.index! + m[0].length, m.index! + m[0].length + 200);
    if (FIXED_LITERAL.test(arg) || FIXED_PREFIX.test(arg)) continue;
    const ident = arg.match(/^([A-Za-z_$][\w$]*)\s*[,)]/)?.[1];
    if (ident && REVIEWED.some(([f, a]) => file.endsWith(f) && a === ident))
      continue;
    if (ident) {
      // A local constant is fine when it is itself built from a fixed host.
      const defs = [
        ...s.matchAll(
          new RegExp(
            `(?:const|let)\\s+${ident}\\s*=\\s*([\\s\\S]{0,120})`,
            "g",
          ),
        ),
      ].map((d) => d[1]!.trimStart());
      if (
        defs.length > 0 &&
        defs.every((d) => FIXED_LITERAL.test(d) || FIXED_PREFIX.test(d))
      )
        continue;
    }
    bad.push(
      `${file.replace(root + "/", "")}: ${m[1] ?? "fetch"}(${arg.split("\n")[0]!.slice(0, 80)}`,
    );
  }
  return bad;
}

describe("no server request goes to an address a user chose", () => {
  it("has server code to check", () => {
    expect(serverFiles.length).toBeGreaterThan(20);
  });

  it("every server request starts from a fixed https host", () => {
    const bad = serverFiles.flatMap((f) =>
      badRequests(f, readFileSync(f, "utf8")),
    );
    expect(
      bad,
      `server requests without a fixed host:\n${bad.join("\n")}`,
    ).toEqual([]);
  });

  it("the shared host constants are fixed https addresses", () => {
    expect(
      code(
        readFileSync(
          resolve(root, "supabase/functions/_shared/booking.ts"),
          "utf8",
        ),
      ),
    ).toContain(
      code(
        'export const GCAL_GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";',
      ),
    );
    expect(
      code(
        readFileSync(
          resolve(
            root,
            "supabase/functions/_shared/calendar-reconciliation.ts",
          ),
          "utf8",
        ),
      ),
    ).toContain(
      code(
        'const GATEWAY = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";',
      ),
    );
    expect(
      readFileSync(
        resolve(root, "supabase/functions/backlink-snapshot/index.ts"),
        "utf8",
      ),
    ).toContain(
      'const GATEWAY_BASE = "https://connector-gateway.lovable.dev/semrush";',
    );
    expect(
      readFileSync(resolve(root, "src/routes/api/chat.ts"), "utf8"),
    ).toContain('baseURL: "https://ai.gateway.lovable.dev/v1"');
    expect(
      readFileSync(
        resolve(root, "src/integrations/supabase/client.server.ts"),
        "utf8",
      ),
    ).toContain(
      "createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
    );
  });

  it("the chat passes the AI only plain text, so it never downloads a link from a message", () => {
    const chat = readFileSync(resolve(root, "src/routes/api/chat.ts"), "utf8");
    expect(code(chat)).toContain(
      code(
        '.filter((p) => p && p.type === "text" && typeof p.text === "string")',
      ),
    );
  });

  it("would catch a request to an address taken from the user", () => {
    expect(
      badRequests("x/index.ts", "const r = await fetch(body.url);"),
    ).toHaveLength(1);
    expect(
      badRequests(
        "x/index.ts",
        "const target = body.url; await fetch(target, {});",
      ),
    ).toHaveLength(1);
    expect(
      badRequests("x/index.ts", "await fetch(`https://${host}/x`);"),
    ).toHaveLength(1);
    expect(
      badRequests("x/index.ts", "await fetch(`${GCAL_GATEWAY}/freeBusy`, {});"),
    ).toEqual([]);
  });
});
