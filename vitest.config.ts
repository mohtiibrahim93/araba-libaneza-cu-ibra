/**
 * Test-only Vite config.
 *
 * The app build goes through @lovable.dev/vite-tanstack-config (TanStack Start,
 * nitro, the router plugin). None of that is needed — or safe — inside Vitest:
 * the router plugin regenerates routeTree.gen.ts and the nitro plugin expects a
 * build. Vitest picks this file over vite.config.ts automatically, so the tests
 * run against a plain React + jsdom setup with the same "@" alias the app uses.
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
