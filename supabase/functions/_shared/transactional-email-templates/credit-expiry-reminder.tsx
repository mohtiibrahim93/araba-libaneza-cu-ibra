import * as React from "npm:react@19.3.1";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@1.0.12";
import type { TemplateEntry } from "./registry.ts";

/**
 * Credit about to run out (owner, 16-17 Nov 2026; Terms, section 4: "Cu 30
 * de zile înainte de expirare îți trimitem un email de reamintire"). Sent once
 * per credit, 30 days before it expires, only for credit whose unused part
 * comes back in money (credit given under the Terms of 16 November 2026).
 * The Romanian text is the owner's approved wording, word for word; the
 * English one is its translation. Replies go to the school's inbox. Sent by
 * booking-reminders through _shared/credit-reminders.ts.
 */
interface Props {
  name?: string;
  /** What is left, already formatted for the language: "312,50 lei". */
  amount?: string;
  /** The day it expires, already formatted: "25 mai 2027". */
  until?: string;
  lang?: "ro" | "en";
}

const SITE_NAME = "Centrul de Arabă Libaneză";
const CONTACT_EMAIL = "marhaba@centruldearabalibaneza.com";
const WHATSAPP_URL = "https://wa.me/40763124514";

const T = {
  ro: {
    preview: (amount: string, until: string) =>
      `Creditul tău de ${amount} expiră pe ${until}`,
    hi: (n?: string) => (n ? `Bună, ${n}!` : "Bună!"),
    body: (amount: string, until: string) =>
      `Mai ai ${amount} credit la Centrul de Arabă Libaneză, valabil până pe ${until}. Îl poți folosi într-o grupă viitoare, îl poți da altei persoane sau îl poți transforma în lecții private (150 lei lecția). Dacă nu îl folosești până atunci, îți returnăm suma rămasă, minus comisionul de procesare Stripe. Răspunde la acest email sau scrie-ne pe WhatsApp și spune-ne ce alegi.`,
    whatsapp: "WhatsApp",
  },
  en: {
    preview: (amount: string, until: string) =>
      `Your ${amount} credit expires on ${until}`,
    hi: (n?: string) => (n ? `Hi, ${n}!` : "Hi!"),
    body: (amount: string, until: string) =>
      `You still have ${amount} of credit with Centrul de Arabă Libaneză, valid until ${until}. You can use it in a later group, give it to another person, or turn it into private lessons (150 lei a lesson). If you do not use it by then, we refund you what is left, minus the Stripe processing fee. Reply to this email or message us on WhatsApp and tell us what you choose.`,
    whatsapp: "WhatsApp",
  },
} as const;

const Email = ({ name, amount = "", until = "", lang = "ro" }: Props) => {
  const t = T[lang] ?? T.ro;
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{t.preview(amount, until)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>
              <Img
                src="https://centruldearabalibaneza.com/logo-mark.png"
                width="24"
                height="24"
                alt=""
                style={logoMark}
              />
              {SITE_NAME}
            </Text>
          </Section>
          <Heading style={h1}>{t.hi(name)}</Heading>
          <Text style={text}>{t.body(amount, until)}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href={`mailto:${CONTACT_EMAIL}`} style={link}>
              {CONTACT_EMAIL}
            </Link>
            {" · "}
            <Link href={WHATSAPP_URL} style={link}>
              {t.whatsapp} +40 763 124 514
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: Email,
  subject: (d: Props) =>
    d.lang === "en"
      ? `Your ${d.amount ?? ""} credit expires on ${d.until ?? ""}`
      : `Creditul tău de ${d.amount ?? ""} expiră pe ${d.until ?? ""}`,
  // "Răspunde la acest email": the answer reaches the school, not noreply@.
  replyTo: CONTACT_EMAIL,
  displayName: "Credit — reamintire cu 30 de zile înainte de expirare",
  previewData: {
    name: "Ana",
    amount: "312,50 lei",
    until: "25 mai 2027",
    lang: "ro",
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "'Inter', Arial, sans-serif",
};
const container = { padding: "20px 25px", maxWidth: "560px", margin: "0 auto" };
const headerSection = { textAlign: "center" as const, padding: "20px 0 10px" };
const logo = {
  fontSize: "18px",
  fontWeight: "700" as const,
  color: "#1a1a2e",
  margin: "0",
};
const h1 = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: "#1a1a2e",
  margin: "20px 0 16px",
  lineHeight: "1.3",
};
const text = {
  fontSize: "15px",
  color: "#4a4a5a",
  lineHeight: "1.6",
  margin: "0 0 16px",
};
const link = { color: "#dc2626", textDecoration: "underline" };
const hr = { borderColor: "#e5e5e5", margin: "28px 0 20px" };
const footer = { fontSize: "14px", color: "#666", margin: "0 0 4px" };
const logoMark = {
  display: "inline-block",
  verticalAlign: "middle",
  borderRadius: "5px",
  marginRight: "8px",
};
