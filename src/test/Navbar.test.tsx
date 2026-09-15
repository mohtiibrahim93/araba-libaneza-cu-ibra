import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { MemoryRouter } from "./helpers/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { I18nProvider } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";

// I18nProvider reads owner-edited overrides through useSiteTexts(), so it needs
// a QueryClient above it — same nesting order as src/routes/__root.tsx. A fresh client per
// render keeps the cache from leaking between tests; retry off so the offline
// fetch fails fast and the code-shipped strings render.
const renderNavbar = () =>
  render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <I18nProvider>
          <TooltipProvider delayDuration={0}>
            <Navbar />
          </TooltipProvider>
        </I18nProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe("Navbar accessibility", () => {
  beforeEach(() => {
    window.localStorage.setItem("site-language", "ro");
  });

  it("renders aria-labels for the brand link, language switcher, and menu button", () => {
    renderNavbar();

    expect(screen.getByLabelText("Centrul de Arabă Libaneză — arabă libaneză cu Ibra")).toBeInTheDocument();
    expect(screen.getByLabelText("Alege limba site-ului")).toBeInTheDocument();
    expect(screen.getByLabelText("Deschide meniul de navigare")).toBeInTheDocument();
  });

  it("toggles the mobile menu open and closed", () => {
    renderNavbar();

    const menuButton = screen.getByLabelText("Deschide meniul de navigare");
    fireEvent.click(menuButton);
    expect(screen.getByLabelText("Închide meniul de navigare")).toBeInTheDocument();
    expect(screen.getByRole("navigation").querySelector("#mobile-navigation")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Închide meniul de navigare"));
    expect(screen.getByLabelText("Deschide meniul de navigare")).toBeInTheDocument();
  });
});
