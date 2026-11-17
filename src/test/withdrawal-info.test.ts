import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  MODEL_FORM_USE,
  MODEL_WITHDRAWAL_FORM,
  TRADER,
  WITHDRAWAL_PARAGRAPH,
} from "../../supabase/functions/_shared/withdrawal-info";
import { WITHDRAWAL_NOTE } from "@/lib/refundRules";

/**
 * The right of withdrawal before payment and in the confirmation email
 * (owner, 17 Nov 2026: the lawyer's draft dropped, "apply the proposed
 * things"): conditions, time limit, how, and the model withdrawal form.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const terms = read("src/pages/Terms.tsx");

describe("one text, in the Terms and in the email", () => {
  it("the email repeats the Terms' 14-day paragraph word for word", () => {
    expect(terms).toContain(JSON.stringify(WITHDRAWAL_PARAGRAPH.ro));
    expect(terms).toContain(JSON.stringify(WITHDRAWAL_PARAGRAPH.en));
  });

  it("the form names the school as section 9 of the Terms does", () => {
    expect(terms).toContain('"Firma: E-SERVICES TODAY S.R.L."');
    expect(terms).toContain(`"Sediu social: ${TRADER.address}"`);
    expect(terms).toContain(`"Registered office: ${TRADER.address}"`);
    expect(MODEL_WITHDRAWAL_FORM.ro.lines[0]).toBe(
      "Către E-SERVICES TODAY S.R.L. (Centrul de Arabă Libaneză), Str. Dantelei nr. 12-14G, Bragadiru, județul Ilfov, cod poștal 077025, telefon +40 763 124 514, e-mail marhaba@centruldearabalibaneza.com:",
    );
  });
});

describe("the model form, in the law's own words", () => {
  it("Romanian (Directive 2011/83/EU, annex I part B, EUR-Lex)", () => {
    const f = MODEL_WITHDRAWAL_FORM.ro;
    expect(f.title).toBe("Model de formular de retragere");
    expect(f.note).toBe(
      "(prezentul formular se trimite înapoi completat doar dacă doriți să vă retrageți din contract)",
    );
    expect(f.lines.slice(1)).toEqual([
      "Vă informez/vă informăm (*) prin prezenta cu privire la retragerea mea/noastră (*) din contractul referitor la vânzarea următoarelor bunuri (*)/prestarea următoarelor servicii (*)",
      "Comandate la data (*)/primite la data (*)",
      "Numele consumatorului (consumatorilor)",
      "Adresa consumatorului (consumatorilor)",
      "Semnătura consumatorului (consumatorilor) (doar în cazul în care acest formular este notificat pe hârtie)",
      "Data",
    ]);
    expect(f.footnote).toBe("(*) A se elimina mențiunea inutilă, după caz.");
  });

  it("English", () => {
    const f = MODEL_WITHDRAWAL_FORM.en;
    expect(f.title).toBe("Model withdrawal form");
    expect(f.note).toBe(
      "(complete and return this form only if you wish to withdraw from the contract)",
    );
    expect(f.lines.slice(1)).toEqual([
      "I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)/for the provision of the following service (*),",
      "Ordered on (*)/received on (*),",
      "Name of consumer(s),",
      "Address of consumer(s),",
      "Signature of consumer(s) (only if this form is notified on paper),",
      "Date",
    ]);
    expect(f.footnote).toBe("(*) Delete as appropriate.");
  });
});

describe("in the Terms", () => {
  it("section 4.2 holds the form, and section 4 points to it", () => {
    expect(terms).toContain('"4.2 Model de formular de retragere"');
    expect(terms).toContain('"4.2 Model withdrawal form"');
    expect(terms).toContain("...MODEL_WITHDRAWAL_FORM.ro.lines,");
    expect(terms).toContain("...MODEL_WITHDRAWAL_FORM.en.lines,");
    expect(terms).toContain(
      "`${MODEL_FORM_USE.ro} Îl găsești la secțiunea 4.2.`",
    );
    expect(terms).toContain(
      "`${MODEL_FORM_USE.en} You will find it in section 4.2.`",
    );
    expect(MODEL_FORM_USE.ro).toContain("nu este obligatoriu");
  });
});

describe("before payment", () => {
  it("the checkout and the sign-up form say it, with the Terms one click away", () => {
    expect(WITHDRAWAL_NOTE.href).toEqual({ ro: "/terms", en: "/en/terms" });
    for (const file of [
      "src/pages/Checkout.tsx",
      "src/components/RegistrationFormSection.tsx",
    ]) {
      const src = read(file);
      expect(src, file).toContain("data-withdrawal-note");
      expect(src, file).toMatch(/WITHDRAWAL_NOTE\.text\[/);
      expect(src, file).toMatch(/WITHDRAWAL_NOTE\.href\[/);
    }
  });
});

describe("in the confirmation email", () => {
  it("every course's sign-up confirmation carries it", () => {
    for (const kind of ["group", "private", "kids"]) {
      const src = read(
        `supabase/functions/_shared/transactional-email-templates/${kind}-registration-confirmation.tsx`,
      );
      expect(src, kind).toContain(
        'import { WithdrawalSection } from "./withdrawal-section.tsx";',
      );
      expect(src, kind).toContain("<WithdrawalSection lang={lang} />");
    }
    const section = read(
      "supabase/functions/_shared/transactional-email-templates/withdrawal-section.tsx",
    );
    expect(section).toContain("{WITHDRAWAL_PARAGRAPH[lang]}");
    expect(section).toContain("{MODEL_FORM_USE[lang]}");
    expect(section).toContain("form.lines.map");
  });
});
