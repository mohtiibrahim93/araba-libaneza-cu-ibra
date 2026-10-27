import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import ts from "typescript";

/** Load a Deno helper without adding its runtime types to the browser build. */
export function loadEdgeModule(
  path: string,
  imports: Record<string, unknown>,
  deno?: unknown,
) {
  const compiled = ts.transpileModule(
    readFileSync(resolve(process.cwd(), path), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const exports: Record<string, unknown> = {};
  new Function("require", "exports", "Deno", compiled)(
    (name: string) => {
      if (name in imports) return imports[name];
      // A sibling helper (`./cohort-sessions.ts`) is pure code: load it too,
      // with the same stubs, instead of making every test stub it.
      if (name.startsWith("./") || name.startsWith("../")) {
        return loadEdgeModule(
          relative(process.cwd(), resolve(process.cwd(), dirname(path), name)),
          imports,
          deno,
        );
      }
      throw new Error(`Unstubbed edge dependency: ${name}`);
    },
    exports,
    deno,
  );
  return exports;
}

/** Execute the actual Deno handler with service boundaries supplied by the test. */
export function loadEdgeHandler(
  path: string,
  imports: Record<string, unknown>,
  env: Record<string, string> = {},
) {
  let handler: (req: Request) => Promise<Response>;
  const source = readFileSync(resolve(process.cwd(), path), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const deno = {
    env: { get: (name: string) => env[name] },
    serve: (fn: typeof handler) => {
      handler = fn;
    },
  };
  new Function("require", "exports", "Deno", compiled)(
    (name: string) => {
      if (name in imports) return imports[name];
      // Emails about lessons deleted in Google: a service boundary that only
      // the calendar sync's own tests need to see, so a no-op by default.
      if (name === "../_shared/calendar-cancel-emails.ts")
        return { notifyGoogleCancellations: async () => {} };
      // The package-lesson helpers (`../_shared/package-lessons.ts`,
      // `../_shared/package-titles.ts`) are shared code, not a service
      // boundary: load them as they are, with the same stubs and environment.
      // Their Google calls need keys a test does not set, so they do nothing.
      // The group refund rule (`../_shared/group-refund.ts`) is plain
      // arithmetic and loads the same way.
      if (
        /^\.\.\/_shared\/(package-(lessons|titles)|group-refund)\.ts$/.test(
          name,
        )
      )
        return loadEdgeModule(
          relative(process.cwd(), resolve(process.cwd(), dirname(path), name)),
          imports,
          deno,
        );
      throw new Error(`Unstubbed edge dependency: ${name}`);
    },
    {},
    deno,
  );
  return (req: Request) => handler(req);
}
