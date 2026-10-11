import * as React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { I18nProvider } from "@/lib/i18n";
import NativeScheduler from "@/components/NativeScheduler";

vi.mock("@/hooks/useSiteTexts", () => ({ useSiteTexts: () => [] }));
vi.mock("@/lib/router-compat", () => ({ Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: null } }) },
  functions: { invoke: async () => ({ data: null, error: null }) },
} }));

class Boundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? <p>Scheduler crashed</p> : this.props.children; }
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it("renders the empty state for an older backend without a date map", async () => {
  localStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
    event_type: { name_ro: "Probă", name_en: "Trial", duration_min: 30 }, slots: [], tz: "Europe/Bucharest",
  }))));
  render(<I18nProvider initialLang="en"><Boundary><NativeScheduler eventType="trial" /></Boundary></I18nProvider>);
  expect(await screen.findByText(/no available times|no times available|no available slots/i)).toBeInTheDocument();
  expect(screen.queryByText("Scheduler crashed")).not.toBeInTheDocument();
});
