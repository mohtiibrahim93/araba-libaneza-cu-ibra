import { describe, expect, it } from "vitest";
import * as React from "react";
import { render } from "@react-email/components";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { SignupEmail } from "../lib/email-templates/signup";
import { MagicLinkEmail } from "../lib/email-templates/magic-link";

// Execute the real Deno templates using the installed equivalent npm modules.
// Only module specifiers and TSX syntax are adapted; template logic stays intact.
function loadEdgeTemplate(file: string, exportedName: string) {
  const require = createRequire(import.meta.url);
  const source = readFileSync(file, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText;
  const module = { exports: {} as Record<string, React.ComponentType<any>> };
  const edgeRequire = (name: string) => {
    if (name === "npm:react@19.3.0") return require("react");
    if (name === "npm:@react-email/components@1.0.12") return require("@react-email/components");
    throw new Error(`Unexpected edge-template import: ${name}`);
  };
  new Function("require", "module", "exports", compiled)(edgeRequire, module, module.exports);
  return module.exports[exportedName]!;
}

const templates = [
  ["website signup", SignupEmail],
  ["website login", MagicLinkEmail],
  ["edge signup", loadEdgeTemplate("supabase/functions/_shared/email-templates/signup.tsx", "SignupEmail")],
  ["edge login", loadEdgeTemplate("supabase/functions/_shared/email-templates/magic-link.tsx", "MagicLinkEmail")],
] as const;
const props = {
  siteName: "Ibra",
  siteUrl: "https://example.test",
  recipient: "visitor@example.test",
  confirmationUrl: "https://example.test/confirm?token=link-token",
};

describe.each(templates)("%s email", (_name, Template) => {
  it("renders the code in visible HTML, preserving leading zeros", async () => {
    const html = await render(React.createElement(Template, { ...props, token: "012345" }));
    const body = new DOMParser().parseFromString(html, "text/html").body;
    body.querySelectorAll('[style*="display:none"], [style*="display: none"]').forEach((node) => node.remove());
    expect(body.textContent).toContain("012345");
    expect(body.textContent).toContain("pagina pe care ai lăsat-o deschisă");
    expect(body.querySelector(`a[href="${props.confirmationUrl}"]`)).not.toBeNull();
  });

  it("includes the same code in the plain-text email", async () => {
    const text = await render(React.createElement(Template, { ...props, token: "012345" }), { plainText: true });
    expect(text).toContain("012345");
    expect(text).toContain(props.confirmationUrl);
  });

  it("renders the eight-digit code this project actually sends", async () => {
    // Supabase's OTP length is a project setting (6-10); this one is on 8, and
    // a real code from a real inbox read 20137377. The six-digit case above
    // passed while the booking screen refused to accept the live length.
    const html = await render(React.createElement(Template, { ...props, token: "20137377" }));
    const body = new DOMParser().parseFromString(html, "text/html").body;
    body.querySelectorAll('[style*="display:none"], [style*="display: none"]').forEach((node) => node.remove());
    expect(body.textContent).toContain("20137377");
  });

  it("keeps link-based sign-in working when the hook supplies no code", async () => {
    const html = await render(React.createElement(Template, props));
    const body = new DOMParser().parseFromString(html, "text/html").body;
    expect(body.querySelector(`a[href="${props.confirmationUrl}"]`)).not.toBeNull();
    expect(body.textContent).not.toContain("012345");
    expect(body.textContent).not.toContain("undefined");
  });
});
