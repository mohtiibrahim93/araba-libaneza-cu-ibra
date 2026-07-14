import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import { I18nProvider } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <I18nProvider>
        <TooltipProvider delayDuration={0}>
          <Navbar />
        </TooltipProvider>
      </I18nProvider>
    </MemoryRouter>,
  );

describe("Navbar accessibility", () => {
  beforeEach(() => {
    window.localStorage.setItem("site-language", "ro");
  });

  it("renders aria-labels for the brand link, language switcher, and menu button", () => {
    renderNavbar();

    expect(screen.getByLabelText("7ki Lebnene — Arabă libaneză cu Ibra")).toBeInTheDocument();
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
