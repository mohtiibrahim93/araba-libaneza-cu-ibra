import * as React from "npm:react@19.3.0";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@1.0.12";
import type { TemplateEntry } from "./registry.ts";

/**
 * After a lesson (owner's request, 14 October 2026): the student confirms it
 * took place with one click on their lesson page. If nobody confirms, the
 * lesson counts as done by itself 48 hours after it ended.
 */

const SITE_NAME = "Arabă Libaneză cu Ibra";

interface Props {
  name?: string;
  whenLabel?: string;
  confirmUrl?: string;
  lang?: "ro" | "en";
}

const T = {
  ro: {
    preview: "Confirmă lecția de azi",
    hi: (n?: string) => (n ? `Salut, ${n}!` : "Salut!"),
    body: "Lecția ta s-a încheiat. Te rog confirmă cu un click că a avut loc.",
    when: "Lecția",
    cta: "Confirm că lecția a avut loc",
    auto: "Dacă nu confirmi, o considerăm făcută după 48 de ore. Dacă ceva n-a fost în regulă, răspunde la acest email.",
    footer: "Mulțumesc,",
  },
  en: {
    preview: "Confirm today's lesson",
    hi: (n?: string) => (n ? `Hi, ${n}!` : "Hi!"),
    body: "Your lesson has ended. Please confirm with one click that it took place.",
    when: "Lesson",
    cta: "Confirm the lesson took place",
    auto: "If you don't confirm, it counts as done after 48 hours. If something wasn't right, just reply to this email.",
    footer: "Thank you,",
  },
} as const;

const Email = ({ name, whenLabel, confirmUrl, lang = "ro" }: Props) => {
  const t = T[lang];
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
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
          <Text style={text}>{t.body}</Text>
          {whenLabel && (
            <Section style={detailsBox}>
              <Text style={infoText}>
                <strong>{t.when}:</strong> {whenLabel}
              </Text>
            </Section>
          )}
          {confirmUrl && (
            <Section style={ctaSection}>
              <Button style={button} href={confirmUrl}>
                {t.cta}
              </Button>
            </Section>
          )}
          <Text style={text}>{t.auto}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            {t.footer} {SITE_NAME}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: Email,
  subject: (d: Props) =>
    d.lang === "en" ? "Did your lesson take place?" : "A avut loc lecția ta?",
  displayName: "Booking — confirm the lesson took place",
  previewData: {
    name: "Maria",
    whenLabel: "12 iun. 2026, 14:00",
    confirmUrl: "https://example.com/booking/manage/xxx?done=1",
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
const detailsBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "12px",
  padding: "18px",
  margin: "20px 0",
};
const infoText = {
  fontSize: "14px",
  color: "#4a4a5a",
  lineHeight: "1.6",
  margin: "0 0 8px",
};
const ctaSection = { textAlign: "center" as const, margin: "28px 0" };
const button = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600" as const,
  textDecoration: "none",
  display: "inline-block",
};
const hr = { borderColor: "#e5e5e5", margin: "28px 0 20px" };
const footer = { fontSize: "14px", color: "#666", margin: "0 0 4px" };
const logoMark = {
  display: "inline-block",
  verticalAlign: "middle",
  borderRadius: "5px",
  marginRight: "8px",
};
