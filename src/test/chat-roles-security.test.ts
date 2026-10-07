import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("course chat role boundary", () => {
  const source = readFileSync("src/routes/api/chat.ts", "utf8");
  it("never promotes a browser-supplied role to assistant authority", () => {
    expect(source).toContain('role: "user" as const');
    expect(source).not.toMatch(/role:\s*m\.role/);
    expect(source).toContain("convertToModelMessages(sanitizedMessages)");
  });
  it("keeps the system instructions server-owned", () => {
    expect(source).toContain("system: ASK_SYSTEM_PROMPT");
  });
});