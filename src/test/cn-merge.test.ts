import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { twMerge as twMergeEs5 } from "tailwind-merge/es5";
import { twMerge as twMergeDefault } from "tailwind-merge";
import { cn } from "@/lib/utils";

/**
 * cn() reads tailwind-merge from its own entry point, and must behave identically.
 *
 * Why the es5 entry: streamdown depends on tailwind-merge too, and the chat panel
 * is the only thing that imports streamdown — behind a lazy() boundary. The
 * bundler put the shared tailwind-merge module in the same chunk as streamdown,
 * so cn(), which every component calls, pulled that chunk into the module graph
 * the Cloudflare worker parses before it can render any page: streamdown, shiki,
 * mermaid and @streamdown/math, about 2 MB, on every page render.
 *
 * "tailwind-merge/es5" is the same library at a different file, so the app and
 * streamdown no longer share one module and the chunk stays behind the lazy
 * boundary. Measured on a production build: the graph parsed at cold start went
 * from 4.77 MB to 2.90 MB, and streamdown, mermaid and shiki left it entirely.
 *
 * The cost is 6 KB of transpiled output and the risk that the two builds could
 * diverge, which is what this test is for. If tailwind-merge ever drops the es5
 * entry, use an npm alias of the same package instead — the mechanism matters
 * less than keeping the two module graphs apart.
 */
describe("cn() merges classes the same way through either entry point", () => {
  it("imports the separate entry, on purpose", () => {
    const src = readFileSync(resolve(process.cwd(), "src/lib/utils.ts"), "utf8");
    expect(src).toContain('from "tailwind-merge/es5"');
  });

  // Conflicts, arbitrary values, variants, negatives — the cases where a
  // divergence between the two builds would actually show on the page.
  const cases: (string | (string | false | undefined)[])[] = [
    ["px-2", "px-4"],
    ["p-4", "px-2"],
    ["text-sm", "text-lg"],
    ["bg-red-500", "bg-primary"],
    ["text-foreground/80", "text-foreground"],
    ["hover:bg-primary/90", "hover:bg-primary"],
    ["-mt-0.5", "mt-2"],
    ["w-[calc(100%-2rem)]", "w-full"],
    ["grid-cols-[1fr_auto]", "grid-cols-2"],
    ["rounded-xs", "rounded-2xl"],
    ["md:flex", "lg:flex", "hidden"],
    ["outline-hidden", "outline-2"],
    ["min-h-[80vh]", "min-h-screen"],
    ["font-semibold", "font-bold", false, undefined],
    ["shadow-lg", "shadow-2xl", "transition-transform"],
    ["inline-flex items-center gap-2", "gap-4"],
  ];

  it.each(cases.map((c) => [JSON.stringify(c), c] as const))(
    "%s merges identically",
    (_label, input) => {
      const args = Array.isArray(input) ? input : [input];
      expect(twMergeEs5(...(args.filter(Boolean) as string[]))).toBe(
        twMergeDefault(...(args.filter(Boolean) as string[])),
      );
      // And cn() itself, which adds clsx on top.
      expect(cn(...(args as never[]))).toBe(
        twMergeDefault(...(args.filter(Boolean) as string[])),
      );
    },
  );
});
