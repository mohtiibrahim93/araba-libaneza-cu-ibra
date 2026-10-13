import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import ts from "typescript";

/** Load a Deno helper without adding its runtime types to the browser build. */
export function loadEdgeModule(path: string, imports: Record<string, unknown>) {
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
  new Function("require", "exports", compiled)((name: string) => {
    if (name in imports) return imports[name];
    // A sibling helper (`./cohort-sessions.ts`) is pure code: load it too,
    // with the same stubs, instead of making every test stub it.
    if (name.startsWith("./") || name.startsWith("../")) {
      return loadEdgeModule(
        relative(process.cwd(), resolve(process.cwd(), dirname(path), name)),
        imports,
      );
    }
    throw new Error(`Unstubbed edge dependency: ${name}`);
  }, exports);
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
  new Function("require", "exports", "Deno", compiled)(
    (name: string) => {
      if (!(name in imports))
        throw new Error(`Unstubbed edge dependency: ${name}`);
      return imports[name];
    },
    {},
    {
      env: { get: (name: string) => env[name] },
      serve: (fn: typeof handler) => {
        handler = fn;
      },
    },
  );
  return (req: Request) => handler(req);
}
