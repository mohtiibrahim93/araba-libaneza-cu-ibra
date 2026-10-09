import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@/lib/i18n";
import { CONSENT_KEY, OPEN_CONSENT_EVENT, readConsent, saveConsent } from "@/lib/cookieConsent";

vi.mock("@/components/LocalizedLink", () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

import CookieConsentBanner from "@/components/CookieConsentBanner";

const GRANTED = { analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" };
const DENIED = { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };

const renderBanner = (force = true) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <I18nProvider initialLang="ro">
        <CookieConsentBanner force={force} />
      </I18nProvider>
    </QueryClientProvider>,
  );

describe("cookie consent (Google Consent Mode v2)", () => {
  let gtag: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    localStorage.clear();
    gtag = vi.fn();
    (window as unknown as { gtag: unknown }).gtag = gtag;
  });

  it("reads only the two known choices", () => {
    expect(readConsent()).toBeNull();
    localStorage.setItem(CONSENT_KEY, "maybe");
    expect(readConsent()).toBeNull();
    localStorage.setItem(CONSENT_KEY, "all");
    expect(readConsent()).toBe("all");
  });

  it("shows the banner when no choice is stored, and accepting grants all four signals", () => {
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: "Acceptă toate" }));
    expect(localStorage.getItem(CONSENT_KEY)).toBe("all");
    expect(gtag).toHaveBeenCalledWith("consent", "update", GRANTED);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("essential only stores the choice and keeps consent denied", () => {
    renderBanner();
    fireEvent.click(screen.getByRole("button", { name: "Doar esențiale" }));
    expect(localStorage.getItem(CONSENT_KEY)).toBe("essential");
    expect(gtag).not.toHaveBeenCalledWith("consent", "update", GRANTED);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("stays hidden once a choice exists, and the footer event reopens it", () => {
    localStorage.setItem(CONSENT_KEY, "essential");
    renderBanner();
    expect(screen.queryByRole("dialog")).toBeNull();
    act(() => {
      window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("withdrawing after accepting sends denied", () => {
    saveConsent("all");
    saveConsent("essential");
    expect(gtag).toHaveBeenLastCalledWith("consent", "update", DENIED);
  });

  it("links to the privacy policy", () => {
    renderBanner();
    expect(screen.getByRole("link", { name: "Politica de confidențialitate" }).getAttribute("href")).toBe("/privacy");
  });

  it("does not render under the test environment unless forced", () => {
    renderBanner(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("root no longer loads Adopt and re-grants a stored 'all' before gtag config", () => {
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    expect(root).not.toMatch(/goadopt|ADOPT_WEBSITE_CODE/);
    expect(root).toContain("<CookieConsentBanner />");
    const def = root.indexOf("gtag('consent', 'default'");
    const upd = root.indexOf('localStorage.getItem("cookie_consent") === "all"');
    const cfg = root.indexOf("gtag('config'");
    expect(def).toBeGreaterThan(-1);
    expect(upd).toBeGreaterThan(def);
    expect(cfg).toBeGreaterThan(upd);
  });
});
