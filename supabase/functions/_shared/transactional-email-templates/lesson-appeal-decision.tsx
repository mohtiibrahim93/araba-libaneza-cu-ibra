import * as React from "npm:react@19.3.0";
import {
  Body,
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
 * To the student (26 October 2026): the owner's answer to their appeal of a
 * lesson counted as lost. Accepted: it does not count against the package.
 */
const SITE_NAME = "Arabă Libaneză cu Ibra";

interface Props {
  name?: string;
  whenLabel?: string;
  accepted?: boolean;
  lessonsLeft?: number | null;
  lang?: "ro" | "en";
}

const T = {
  ro: {
    hi: (n?: string) => (n ? `Salut, ${n}!` : "Salut!"),
    yes: "Am înțeles motivul: lecția nu se numără din pachet.",
    no: "Am citit ce mi-ai scris, dar lecția rămâne numărată din pachet. Regula este ca anulările să fie făcute cu cel puțin 24 de ore înainte, ca să pot da ora altcuiva.",
    when: "Lecția",
    left: (n: number) =>
      n === 1 ? "Mai ai 1 lecție în pachet." : `Mai ai ${n} lecții în pachet.`,
    reply: "Dacă vrei să mai discutăm, răspunde la acest email.",
    footer: "Mulțumesc,",
  },
  en: {
    hi: (n?: string) => (n ? `Hi, ${n}!` : "Hi!"),
    yes: "I understand the reason: the lesson does not count against your package.",
    no: "I read your message, but the lesson still counts against your package. Cancellations need at least 24 hours' notice, so I can offer the hour to someone else.",
    when: "Lesson",
    left: (n: number) =>
      n === 1
        ? "You have 1 lesson left in your package."
        : `You have ${n} lessons left in your package.`,
    reply: "If you'd like to talk about it, just reply to this email.",
    footer: "Thank you,",
  },
} as const;

const Email = ({
  name,
  whenLabel,
  accepted,
  lessonsLeft,
  lang = "ro",
}: Props) => {
  const t = T[lang];
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{accepted ? t.yes : t.no}</Preview>
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
          <Text style={text}>{accepted ? t.yes : t.no}</Text>
          {whenLabel && (
            <Section style={detailsBox}>
              <Text style={infoText}>
                <strong>{t.when}:</strong> {whenLabel}
              </Text>
            </Section>
          )}
          {typeof lessonsLeft === "number" && lessonsLeft >= 0 && (
            <Text style={text}>{t.left(lessonsLeft)}</Text>
          )}
          <Text style={text}>{t.reply}</Text>
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
    d.lang === "en"
      ? "About your missed lesson"
      : "Despre lecția pe care ai ratat-o",
  displayName: "Booking — answer to a lesson appeal",
  previewData: {
    name: "Ioan",
    whenLabel: "12 nov. 2026, 18:00",
    accepted: true,
    lessonsLeft: 6,
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
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "18px",
  margin: "20px 0",
};
const infoText = {
  fontSize: "14px",
  color: "#4a4a5a",
  lineHeight: "1.6",
  margin: "0",
};
const hr = { borderColor: "#e5e5e5", margin: "28px 0 20px" };
const footer = { fontSize: "14px", color: "#666", margin: "0 0 4px" };
const logoMark = {
  display: "inline-block",
  verticalAlign: "middle",
  borderRadius: "5px",
  marginRight: "8px",
};
