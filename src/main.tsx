import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
// Self-hosted display fonts (headlines + brand lockup) — no external CDN.
import "@fontsource/lora/600.css";
import "@fontsource/lora/700.css";
import "@fontsource/noto-naskh-arabic/600.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
