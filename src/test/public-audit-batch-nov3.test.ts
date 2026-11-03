import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FAQ_CONTENT } from "@/data/faq";
import { formatLei } from "@/lib/pricing";
import { cohortHref, nextOpenCohort } from "@/lib/nextCohort";
import type { Cohort } from "@/lib/cohortTypes";

// Public-site findings from the Claude in Chrome pass
// (docs/SITE_AUDIT_2026-10.md, 1 Nov 2026), fixed 3 Nov 2026.
const read = (p: string) => readFileSync(p, "utf8");

describe("the address decides the language (P1 #3)", () => {
  it("a Romanian page with an English twin is Romanian on every navigation", () => {
    const root = read("src/routes/__root.tsx");
    expect(root).toContain(
      'languageCounterpart(pathname, "en") && lang !== "ro"',
    );
    const i18n = read("src/lib/i18n.tsx");
    expect(i18n).toContain(
      'if (languageCounterpart(window.location.pathname, "en")) return;',
    );
  });
});

describe("top bar on English pages (#13, #14, #35)", () => {
  const cohort = (over: Partial<Cohort>) =>
    ({
      id: "x",
      level: "A1",
      format: "online",
      start_date: "2026-11-07",
      teaching_language: "ro",
      full: false,
      seatsLeft: 4,
      ...over,
    }) as Cohort;
  const ro = cohort({ id: "ro" });
  const en = cohort({
    id: "en",
    start_date: "2026-11-21",
    teaching_language: "en",
  });
  const today = new Date("2026-11-03T10:00:00Z");

  it("names the group taught in the reader's language first", () => {
    expect(nextOpenCohort([ro, en], today, "en")?.id).toBe("en");
    expect(nextOpenCohort([ro, en], today, "ro")?.id).toBe("ro");
    expect(nextOpenCohort([ro], today, "en")?.id).toBe("ro");
  });

  it("links an English reader to the English level page", () => {
    expect(cohortHref(en, "en")).toBe(
      "/en/courses/group/a1?mod=online&predare=en",
    );
    expect(cohortHref(ro)).toBe("/cursuri/grup/a1?mod=online&predare=ro");
  });

  it("header anchors point at the home page in the reader's language", () => {
    expect(read("src/components/Navbar.tsx")).toContain(
      "href={`${homePath}${l.href}`}",
    );
  });
});

describe("FAQ has the same questions in both languages (#26)", () => {
  it("counts match, group by group", () => {
    const count = (l: "ro" | "en") =>
      FAQ_CONTENT[l].groups.map((g) => g.items.length);
    expect(count("en")).toEqual(count("ro"));
  });
});

describe("English prices use English number format (#27)", () => {
  it("1,700 in English, 1.700 in Romanian", () => {
    expect(formatLei(1700, "en")).toBe("1,700");
    expect(formatLei(1700)).toBe("1.700");
  });
});

describe("seat badge never adds groups taught in different languages (#17)", () => {
  it("counts the reader's language first", () => {
    const badge = read("src/components/SpotsBadge.tsx");
    expect(badge).toContain("c.teaching_language === lang");
  });
});

describe("copy that contradicted itself", () => {
  it("quiz: about 30 seconds, three questions, one native teacher (#24)", () => {
    const i18n = read("src/lib/i18n.tsx");
    expect(i18n).not.toContain("Durează sub două minute");
    expect(i18n).toContain("Grupuri mici, un profesor nativ");
  });

  it("the trial card on /preturi states the no-show charge (#21)", () => {
    expect(read("src/pages/Preturi.tsx")).toContain(
      "Dacă nu vii sau anulezi cu mai puțin de 24 de ore înainte",
    );
  });

  it("B1 allows a group to add the alphabet, like C1 says (#23)", () => {
    expect(read("src/data/curriculum.ts")).not.toContain(
      "Exclusiv vorbit — fără alfabet arab.",
    );
  });
});

describe("no email or name in checkout addresses", () => {
  it("links to /checkout carry neither; the tab's storage does", () => {
    for (const f of [
      "src/components/PaymentInstructions.tsx",
      "src/components/NativeScheduler.tsx",
    ]) {
      const src = read(f);
      expect(src).toContain("saveCheckoutContact(");
      expect(src).not.toMatch(/params\.set\("(email|name)"/);
      expect(src).not.toContain("&email=${");
    }
    expect(
      read("supabase/functions/create-checkout-session/index.ts"),
    ).not.toContain("&email=${encodeURIComponent(reg.email");
  });

  it("an older link is read once and the address cleaned", () => {
    const checkout = read("src/pages/Checkout.tsx");
    expect(checkout).toContain('clean.searchParams.delete("email")');
    expect(checkout).toContain("window.history.replaceState(");
    expect(checkout).toContain("onEmailEntered={typeEmail}");
  });
});

describe("redirect aliases never point a real page elsewhere", () => {
  it("/en/prices ends on /preturi, and /preturi itself is not redirected", async () => {
    const { resolveRedirect } = await import("@/lib/redirects");
    expect(resolveRedirect("/en/prices")).toBe("/preturi");
    expect(resolveRedirect("/preturi")).toBeNull();
    expect(resolveRedirect("/pricing")).toBe("/preturi");
  });
});
