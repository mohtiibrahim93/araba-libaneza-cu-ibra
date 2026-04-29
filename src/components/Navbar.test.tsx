import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import Navbar from "./Navbar";
import { I18nProvider } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";

const renderNavbar = () =>
  render(
    <I18nProvider>
      <TooltipProvider delayDuration={0}>
        <Navbar />
      </TooltipProvider>
    </I18nProvider>,
  );

const expectTooltipAfterHover = async (element: HTMLElement, text: string) => {
  fireEvent.pointerMove(element);
  await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent(text));
};

const expectTooltipAfterFocus = async (element: HTMLElement, text: string) => {
  fireEvent.focus(element);
  await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent(text));
};

describe("Navbar accessibility", () => {
  beforeEach(() => {
    window.localStorage.setItem("site-language", "ro");
  });

  it("renders aria-labels for the brand flag, language switcher, WhatsApp link, and menu button", () => {
    renderNavbar();

    expect(screen.getByLabelText("centrul de araba libaneza — Steagul Libanului")).toBeInTheDocument();
    expect(screen.getByLabelText("Steagul Libanului")).toBeInTheDocument();
    expect(screen.getByLabelText("Alege limba site-ului")).toBeInTheDocument();
    expect(screen.getByLabelText("Contactează-ne pe WhatsApp")).toBeInTheDocument();
    expect(screen.getByLabelText("Deschide meniul de navigare")).toBeInTheDocument();
  });

  it("opens tooltips on hover for navbar controls", async () => {
    renderNavbar();

    await expectTooltipAfterHover(
      screen.getByLabelText("centrul de araba libaneza — Steagul Libanului"),
      "Steagul Libanului",
    );

    await expectTooltipAfterHover(screen.getByRole("link", { name: "Prețuri" }), "Prețuri");
    await expectTooltipAfterHover(screen.getByLabelText("Contactează-ne pe WhatsApp"), "Contactează-ne pe WhatsApp");
    await expectTooltipAfterHover(screen.getByLabelText("Deschide meniul de navigare"), "Deschide meniul de navigare");
  });

  it("opens tooltips on keyboard focus for navbar controls", async () => {
    renderNavbar();

    await expectTooltipAfterFocus(
      screen.getByLabelText("centrul de araba libaneza — Steagul Libanului"),
      "Steagul Libanului",
    );

    await expectTooltipAfterFocus(screen.getByRole("link", { name: "FAQ" }), "FAQ");
    await expectTooltipAfterFocus(screen.getByLabelText("Alege limba site-ului"), "Alege limba site-ului");
    await expectTooltipAfterFocus(screen.getByLabelText("Contactează-ne pe WhatsApp"), "Contactează-ne pe WhatsApp");
    await expectTooltipAfterFocus(screen.getByLabelText("Deschide meniul de navigare"), "Deschide meniul de navigare");
  });
});