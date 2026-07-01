import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
