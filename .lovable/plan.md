# Advice: server-bundle chunk grouping and worker cold start (no code changes)

This is advice only. Nothing in the project changes. Anything below that I haven't checked in your build output is marked as a hypothesis to verify.

## 1. Where to change chunk grouping

**Likely cause (unverified):** the `_ssr/` and `_libs/` chunk names come from nitro, not from Vite. With the cloudflare-module preset, nitro takes Vite's SSR output and bundles it again with its own Rolldown pass. That would explain what you saw:
- `chunkFileNames` and a broad `advancedChunks` group show up, because Vite's SSR build runs.
- The final `_libs/*` grouping is decided later by nitro, so narrow groups get flattened again.
- Two builds from the same source can come out different sizes, because nitro's own chunking heuristics decide the final layout.

**Check first:** look at the output of Vite's SSR build (before nitro) and at `.output/server`. If a narrow group survives the first but not the second, nitro is the pass to configure.

**Lever:** set nitro's Rolldown/Rollup output options instead of `vite.build.rollupOptions`. That means the `nitro` config's `rollupConfig.output`, or `rolldownConfig` depending on the nitro version. Recommended group shape there:
- A high-priority group for eagerly shared small libraries only, e.g. `tailwind-merge` and `clsx` (`priority: 30`).
- Do **not** create a group for streamdown, @streamdown/*, shiki, mermaid, @ai-sdk. Naming a group for them pulls them into one chunk that shared code can then reach. That matches the 5.95 MB result you got.
- If available, set `includeDependenciesRecursively: false` on the tailwind-merge group. Then the group holds only that library and doesn't drag in its importers' siblings.

**More robust option that doesn't depend on the bundler:** take the shared edge out of the graph. streamdown imports tailwind-merge itself, which is why the two meet in one chunk. Options:
- Give `cn()` its own copy, so the app and streamdown don't share one module instance: an alias or a vendored copy under `src/lib`.
- Or check that nothing statically imports streamdown's styles, types or re-exports outside the lazy boundary. A `import type` without `type`, or a CSS side-effect import, turns into a real static edge in the SSR build.

Either way, measure with the same check you already use: the size of the static graph reachable from the SSR entry.

## 2. Should the config package do this by default?

Yes, it's a reasonable request. The rule would be: in the server build, a module reachable only through a dynamic import should never share a chunk with a module reachable from the entry, and should be duplicated if necessary. On low-traffic Workers, cold start dominates, so duplicating a small library like tailwind-merge costs almost nothing. I can't change that package from here. Send it to Lovable support as a feature request, with your 4.77 vs 5.95 MB measurements as the reproduction.

## 3. Other things to check for cold start

- **Measure startup directly:** `wrangler deploy --dry-run --outdir` plus `wrangler check startup` gives a CPU profile of startup. Workers has a startup-time limit, and this shows whether the time goes to parsing or to running module-scope code.
- **Module-scope work:** large objects built at import time, such as the seoHead metadata table, i18n dictionaries, blog/page registries, Zod schemas, and the route tree importing every route file. Turning these into lazy getters or JSON imports often matters as much as byte size.
- **Route files:** keep loaders free of heavy imports, since loaders stay in the main server graph even with code splitting.
- **Keep-warm:** a Cron Trigger or external ping every 1–5 minutes to a lightweight route. It doesn't guarantee warm instances in every region, but it removes most cold starts on a low-traffic site.
- **Placement:** check whether Smart Placement is on. It can add routing cost for a site whose backend is in the EU. Either way, compare the bimodal pattern by region using the `cf-ray` suffix.
- **Compressed size vs raw size:** parse time follows the raw size you're already measuring. The 3 MB/10 MB compressed limit doesn't matter here.

## Suggested order

1. Confirm whether nitro's second bundling pass decides `_libs/*`.
2. Try the tailwind-merge-only group in nitro's config, or the separate-copy approach.
3. Profile with `wrangler check startup` to find module-scope costs.
4. Add a keep-warm ping as a cheap way to reduce cold starts while the above is investigated.
