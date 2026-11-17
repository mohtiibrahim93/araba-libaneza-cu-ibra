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
 * The acknowledgement a student gets after pressing "Confirmă retragerea"
 * (or "Confirmă anularea", or asking to move) in "Contul meu" (owner, 17 Nov
 * 2026; Terms, section 4). For a withdrawal it is the acknowledgement of
 * receipt the withdrawal function needs (Directive (EU) 2023/2673, art. 11a):
 * the statement as sent, with the date and time it was sent. Sent by
 * student-cancel. Replies go to the school's inbox.
 */
interface Props {
  kind?: "withdrawal" | "cancellation" | "transfer";
  name?: string;
  email?: string;
  /** The statement exactly as sent. */
  statement?: string;
  /** Date and time it was sent, already written out: "20 noiembrie 2026, ora 14:05 (ora României)". */
  when?: string;
  lang?: "ro" | "en";
}

const SITE_NAME = "Centrul de Arabă Libaneză";
const CONTACT_EMAIL = "marhaba@centruldearabalibaneza.com";
const WHATSAPP_URL = "https://wa.me/40763124514";

const T = {
  ro: {
    subject: {
      withdrawal: "Am primit retragerea ta din contract",
      cancellation: "Am primit cererea ta de anulare",
      transfer: "Am primit cererea ta de mutare",
    },
    hi: (n?: string) => (n ? `Bună, ${n}!` : "Bună!"),
    received: {
      withdrawal: (w: string) =>
        `Am primit declarația ta de retragere din contract, trimisă pe ${w}:`,
      cancellation: (w: string) =>
        `Am primit cererea ta de anulare, trimisă pe ${w}:`,
      transfer: (w: string) => `Am primit cererea ta, trimisă pe ${w}:`,
    },
    name: "Nume",
    email: "Email",
    next: {
      withdrawal:
        "Îți returnăm sumele cuvenite în cel mult 14 zile de la această dată, prin aceeași metodă de plată (Termeni, secțiunea 4).",
      cancellation:
        "Data anulării este data de mai sus. În cel mult 14 zile îți scriem ce primești înapoi (bani, credit sau amândouă) și ți-l trimitem (Termeni, secțiunea 4).",
      transfer:
        "Îți scriem ca să confirmăm mutarea. Până atunci rămâi în grupa ta.",
    },
    keep: "Păstrează acest email: este confirmarea ta.",
    whatsapp: "WhatsApp",
  },
  en: {
    subject: {
      withdrawal: "We received your withdrawal from the contract",
      cancellation: "We received your cancellation",
      transfer: "We received your request to move",
    },
    hi: (n?: string) => (n ? `Hi, ${n}!` : "Hi!"),
    received: {
      withdrawal: (w: string) =>
        `We received your statement of withdrawal from the contract, sent on ${w}:`,
      cancellation: (w: string) =>
        `We received your cancellation, sent on ${w}:`,
      transfer: (w: string) => `We received your request, sent on ${w}:`,
    },
    name: "Name",
    email: "Email",
    next: {
      withdrawal:
        "We refund what is due to you within 14 days of this date, by the same payment method (Terms, section 4).",
      cancellation:
        "The date above is your cancellation date. Within 14 days we write to tell you what you get back (money, credit or both) and send it to you (Terms, section 4).",
      transfer:
        "We will write to confirm the move. Until then you stay in your group.",
    },
    keep: "Keep this email: it is your confirmation.",
    whatsapp: "WhatsApp",
  },
} as const;

const Email = ({
  kind = "withdrawal",
  name,
  email,
  statement = "",
  when = "",
  lang = "ro",
}: Props) => {
  const t = T[lang] ?? T.ro;
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{t.subject[kind]}</Preview>
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
          <Text style={text}>{t.received[kind](when)}</Text>
          <Text style={quote}>{statement}</Text>
          <Text style={text}>
            {t.name}: {name || "-"}
            <br />
            {t.email}: {email || "-"}
          </Text>
          <Text style={text}>{t.next[kind]}</Text>
          <Text style={text}>{t.keep}</Text>
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
    (T[d.lang === "en" ? "en" : "ro"].subject as Record<string, string>)[
      d.kind ?? "withdrawal"
    ] ?? T.ro.subject.withdrawal,
  replyTo: CONTACT_EMAIL,
  displayName: "Contul meu — confirmare retragere / anulare / mutare",
  previewData: {
    kind: "withdrawal",
    name: "Ana",
    email: "ana@example.com",
    statement:
      "Mă retrag din contractul pentru „Curs de grup · A1 · online”, încheiat pe 20 noiembrie 2026.",
    when: "24 noiembrie 2026, ora 14:05 (ora României)",
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
const quote = {
  ...text,
  color: "#1a1a2e",
  borderLeft: "3px solid #e5e5e5",
  paddingLeft: "12px",
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
