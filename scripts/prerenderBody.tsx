/**
 * Turns the built SPA shell into real HTML.
 *
 * `vite build` emits, for every route, an index.html whose <head> is complete
 * (seoPrerender.ts writes it) but whose body is just `<div id="root"></div>`.
 * Google renders JavaScript, but in a second pass that gets queued — which is
 * where "Discovered – currently not indexed" pages sit — and Bing and most AI
 * crawlers do not run JavaScript at all. To them every page was blank.
 *
 * This runs after the build, renders each route with React on the server, and
 * writes the markup into the existing HTML. The client still boots with
 * createRoot, which replaces the prerendered DOM rather than hydrating it —
 * deliberate: the language is read from localStorage on the client and would
 * mismatch server markup that cannot see it. Crawlers get the content, users
 * get an instant first paint, and no hydration mismatch is possible.
 */
import { readFile, writeFile } from "node:fs/promises";
import { Writable } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import type { ReactNode } from "react";
import App from "../src/App";
import { allRoutes } from "./seoPrerender";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const ROOT_DIV = '<div id="root"></div>';

/** What one rendered route yields: its markup, and the head Helmet collected. */
interface Rendered {
  body: string;
  /** JSON-LD blocks the page declared through <Helmet>, as HTML strings. */
  jsonLd: string[];
}

/** react-helmet-async writes its collected head into the context object. */
interface HelmetContext {
  helmet?: { script?: { toString(): string } };
}

/**
 * Pulls the <script type="application/ld+json"> blocks out of Helmet's
 * server output. Only the structured data: title, meta, link and hreflang are
 * already written by seoPrerender, which owns the length guards and the
 * reciprocity check, and emitting them twice is the duplicate-head-tag bug
 * this project has already had once.
 */
function jsonLdFrom(context: HelmetContext): string[] {
  const rendered = context.helmet?.script?.toString() ?? "";
  return rendered.match(/<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/g) ?? [];
}

/** Collects a React stream into a string, or gives up after `ms`. */
function renderRoute(route: string, lang: "ro" | "en", ms = 20_000): Promise<Rendered> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const sink = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(Buffer.from(chunk));
        cb();
      },
    });

    const Router = ({ children }: { children: ReactNode }) => (
      <StaticRouter location={route}>{children}</StaticRouter>
    );

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      stream.abort();
      reject(new Error(`timed out after ${ms}ms`));
    }, ms);

    // Held in a variable on purpose. This used to be an inline `context={{}}`:
    // Helmet dutifully wrote every page's collected head into that object and
    // nothing kept a reference, so all of it was discarded. The visible effect
    // was that 23 pages rendered an FAQ on screen and shipped no FAQPage
    // structured data at all — the schema existed only in the client-side DOM,
    // which is exactly where a crawler that does not run JavaScript can't see
    // it. Same for the Course and BreadcrumbList blocks.
    const helmetContext: HelmetContext = {};

    const stream = renderToPipeableStream(
      <HelmetProvider context={helmetContext}>
        <App Router={Router} lang={lang} />
      </HelmetProvider>,
      {
        // onAllReady, not onShellReady: it waits for every Suspense boundary,
        // so the lazily-imported page components are resolved and rendered
        // instead of leaving the loading fallback in the HTML.
        onAllReady() {
          sink.on("finish", () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({
              body: Buffer.concat(chunks).toString("utf8"),
              jsonLd: jsonLdFrom(helmetContext),
            });
          });
          stream.pipe(sink);
        },
        onError(err) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(err instanceof Error ? err : new Error(String(err)));
        },
      },
    );
  });
}

const distFileFor = (route: string) =>
  route === "/"
    ? path.join(DIST, "index.html")
    : path.join(DIST, route.replace(/^\//, ""), "index.html");

async function main() {
  const routes = allRoutes();
  // Redirect aliases render a <Navigate> and produce no markup on purpose —
  // they exist to bounce visitors and to carry a canonical, not to be read. A
  // canonical pointing elsewhere is the tell, so don't flag them as thin.
  const isAlias = new Map(routes.map((r) => [r.path, !!r.canonical && r.canonical !== r.path]));
  let done = 0;
  let schemaAdded = 0;
  const failures: Array<{ route: string; reason: string }> = [];
  const thin: Array<{ route: string; chars: number }> = [];

  for (const { path: route, lang } of routes) {
    const file = distFileFor(route);
    let html: string;
    try {
      html = await readFile(file, "utf8");
    } catch {
      failures.push({ route, reason: "no built HTML file" });
      continue;
    }
    if (!html.includes(ROOT_DIV)) {
      failures.push({ route, reason: "root div not found — already prerendered?" });
      continue;
    }

    let body: string;
    let jsonLd: string[];
    try {
      ({ body, jsonLd } = await renderRoute(route, lang === "en" ? "en" : "ro"));
    } catch (err) {
      failures.push({ route, reason: err instanceof Error ? err.message : String(err) });
      continue;
    }

    // A page that renders almost nothing is worse than useless — it would ship
    // an empty-looking body to a crawler while claiming to be prerendered.
    const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length < 200 && !isAlias.get(route)) thin.push({ route, chars: text.length });

    let out = html.replace(ROOT_DIV, `<div id="root">${body}</div>`);

    // Fold the page's own structured data into the head it was always meant to
    // be in. seoPrerender already emits FAQPage for the three routes it knows
    // about by name, so skip anything already present rather than shipping the
    // same block twice.
    const fresh = jsonLd.filter((block) => {
      const type = block.match(/"@type"\s*:\s*"([^"]+)"/)?.[1];
      return !type || !out.includes(`"@type":"${type}"`);
    });
    if (fresh.length) {
      out = out.replace("</head>", `${fresh.join("\n")}\n  </head>`);
      schemaAdded += fresh.length;
    }

    await writeFile(file, out, "utf8");
    done++;
  }

  console.log(
    `[prerender-body] rendered ${done}/${routes.length} routes to static HTML` +
      `, folded in ${schemaAdded} JSON-LD block(s) from <Helmet>`,
  );
  if (thin.length) {
    console.warn(
      `[prerender-body] ${thin.length} route(s) rendered very little text:\n` +
        thin.map((t) => `  ${t.route} (${t.chars} chars)`).join("\n"),
    );
  }
  if (failures.length) {
    console.error(
      `[prerender-body] ${failures.length} route(s) failed:\n` +
        failures.map((f) => `  ${f.route}: ${f.reason}`).join("\n"),
    );
    process.exitCode = 1;
  }
}

await main();
