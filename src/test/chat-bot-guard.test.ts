import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { faqAnswer } from "@/lib/askFaq";

describe("course chat cost guards", () => {
  const source = readFileSync("src/routes/api/chat.ts", "utf8");
  it("refuses questions without a bot-check token before calling the AI", () => {
    expect(source.indexOf('"Verification required"')).toBeGreaterThan(0);
    expect(source.indexOf('"Verification required"')).toBeLessThan(
      source.indexOf("streamText({"),
    );
  });
  it("answers suggested questions without the AI model", () => {
    expect(faqAnswer("Cât costă cursul de grup?")).toContain("500 LEI");
    expect(faqAnswer("How much is the group course?")).toContain("700 LEI");
    expect(faqAnswer("Ce mai faci?")).toBeNull();
  });
});
