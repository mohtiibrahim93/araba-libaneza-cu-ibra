import { cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderRoute, currentPath } from "./helpers/appRouter";

/**
 * `/` is the Romanian homepage, and it has to stay Romanian.
 *
 * It is the canonical RO URL and the RO half of the hreflang pair with `/en`.
 * The i18n provider adopts `site-language` from localStorage after hydration,
 * so a returning English reader used to get English copy at `/` — `/en`'s
 * content served at `/`'s address, the same page at two URLs with one of them
 * declaring itself Romanian. That was the lesser evil only while there was no
 * English homepage to send them to.
 *
 * Now there is one, so the preference is honoured by going there rather than
 * by repainting this page.
 */
describe("the homepage sends an English reader to the English homepage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(cleanup);

  it("redirects / to /en when the saved language is English", async () => {
    window.localStorage.setItem("site-language", "en");
    const { router } = renderRoute("/");
    await waitFor(() => expect(currentPath(router)).toBe("/en"));
  });

  it("stays on / when the saved language is Romanian", async () => {
    window.localStorage.setItem("site-language", "ro");
    const { router } = renderRoute("/");
    await waitFor(() => expect(document.body).not.toBeEmptyDOMElement());
    expect(currentPath(router)).toBe("/");
  });

  it("stays on / when nothing has been chosen yet", async () => {
    const { router } = renderRoute("/");
    await waitFor(() => expect(document.body).not.toBeEmptyDOMElement());
    expect(currentPath(router)).toBe("/");
  });

  it("does not redirect away from a Stripe return", async () => {
    // Index.tsx reads ?payment= and ?trial_card= to raise the post-checkout
    // toast. Redirecting would drop the parameter and the toast with it, and
    // this is the one moment a visitor most needs to be told what happened.
    window.localStorage.setItem("site-language", "en");
    const { router } = renderRoute("/?payment=success");
    await waitFor(() => expect(document.body).not.toBeEmptyDOMElement());
    expect(currentPath(router)).toBe("/");
  });

  it("leaves the stored preference alone", async () => {
    // Pinning the page by calling setLang("ro") would have written "ro" to
    // localStorage and wiped the reader's choice for the whole site — the
    // reason this is a redirect and not a language override.
    window.localStorage.setItem("site-language", "en");
    const { router } = renderRoute("/");
    await waitFor(() => expect(currentPath(router)).toBe("/en"));
    expect(window.localStorage.getItem("site-language")).toBe("en");
  });
});
