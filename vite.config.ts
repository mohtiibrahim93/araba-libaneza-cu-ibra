import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Bind on all interfaces (IPv4 + IPv6). Using "::" alone fails with
    // EAFNOSUPPORT in containers without IPv6 (e.g. some GitHub Codespaces),
    // which stops the dev/preview server from ever coming up on the
    // forwarded port. `true` maps to 0.0.0.0 and works everywhere.
    host: true,
    port: 8080,
    // Allow the app to be served through Codespaces / tunnel proxy hostnames
    // (e.g. *.app.github.dev) instead of being rejected as a blocked host.
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mcpPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing vendor code into long-cacheable chunks
        // so an app-code change doesn't bust the whole ~290 KB gzip bundle.
        // The entire React ecosystem MUST stay in one chunk — splitting react
        // from react-dom/router causes duplicate-React "invalid hook call".
        // Only peel out the big, stable, homepage-loaded vendors into
        // long-cacheable chunks. Everything else is left to Rollup's default
        // chunking so admin/PDF-only libs (html2canvas, jspdf, …) stay in
        // their own async chunks and never load on the homepage.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (
            /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|@tanstack[\\/]react-query)[\\/]/.test(
              id,
            )
          ) {
            return "vendor-react";
          }
          if (id.includes("/node_modules/@radix-ui/")) return "vendor-radix";
          if (id.includes("/node_modules/@supabase/")) return "vendor-supabase";
        },
      },
    },
  },
}));
