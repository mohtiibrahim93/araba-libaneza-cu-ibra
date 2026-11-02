import * as React from "npm:react@19.3.1";
import {
  Body,
  Button,
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
 * A group payment started and not finished (owner, 2 Nov 2026). The seat is
 * held for 2 hours. kind "reminder": sent 15 minutes in, with the link to
 * finish and the exact deadline. kind "released": sent at the deadline, the
 * seat is free again and they can sign up again. In the language they
 * booked in. Sent by booking-reminders through _shared/group-holds.ts.
 */
interface Props {
  kind?: "reminder" | "released";
  name?: string;
  group?: string;
  deadline?: string;
  url?: string;
  lang?: "ro" | "en";
}

const SITE_NAME = "Arabă Libaneză cu Ibra";

const T = {
  ro: {
    hi: (n?: string) => (n ? `Salut, ${n}!` : "Salut!"),
    reminder: {
      preview: "Locul tău în grupă te așteaptă",
      intro: (g: string) =>
        `Ai început plata pentru ${g}, dar nu s-a finalizat. Îți păstrăm locul până la:`,
      after:
        "Dacă plata nu este finalizată până atunci, locul se eliberează pentru altcineva.",
      cta: "Finalizează plata",
    },
    released: {
      preview: "Locul tău în grupă a fost eliberat",
      intro: (g: string) =>
        `Plata pentru ${g} nu a fost finalizată la timp, așa că locul păstrat pentru tine a fost eliberat.`,
      after:
        "Dacă vrei în continuare să te alături, te poți înscrie din nou cât timp mai sunt locuri libere.",
      cta: "Înscrie-te din nou",
    },
    footer: "Pe curând,",
  },
  en: {
    hi: (n?: string) => (n ? `Hi, ${n}!` : "Hi!"),
    reminder: {
      preview: "Your place in the group is waiting",
      intro: (g: string) =>
        `You started paying for ${g}, but the payment was not completed. We are holding your place until:`,
      after:
        "If the payment is not completed by then, the place is released for someone else.",
      cta: "Complete your payment",
    },
    released: {
      preview: "Your place in the group was released",
      intro: (g: string) =>
        `The payment for ${g} was not completed in time, so the place we held for you has been released.`,
      after:
        "If you would still like to join, you can sign up again while places are available.",
      cta: "Sign up again",
    },
    footer: "See you soon,",
  },
} as const;

const Email = ({
  kind = "reminder",
  name,
  group = "",
  deadline,
  url = "https://centruldearabalibaneza.com/cursuri/grup",
  lang = "ro",
}: Props) => {
  const t = T[lang] ?? T.ro;
  const k = t[kind] ?? t.reminder;
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{k.preview}</Preview>
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
          <Text style={text}>{k.intro(group)}</Text>
          {kind === "reminder" && deadline && (
            <Text style={deadlineText}>{deadline}</Text>
          )}
          <Text style={text}>{k.after}</Text>
          <Section style={ctaSection}>
            <Button style={button} href={url}>
              {k.cta}
            </Button>
          </Section>
          <Text style={textSmall}>
            <Link href={url} style={link}>
              {url}
            </Link>
          </Text>
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
  subject: (d: Props) => {
    const en = d.lang === "en";
    if (d.kind === "released")
      return en
        ? "Your place in the group was released"
        : "Locul tău în grupă a fost eliberat";
    return en
      ? `Complete your payment by ${d.deadline ?? "the deadline"} to keep your place`
      : `Finalizează plata până ${d.deadline ? `pe ${d.deadline}` : "la termen"} ca să îți păstrezi locul`;
  },
  displayName: "Grupă — plată neterminată (memento / loc eliberat)",
  previewData: {
    kind: "reminder",
    name: "Maria",
    group: "grupa A1 online, în română, care începe pe 7 noiembrie 2026",
    deadline: "luni, 2 noiembrie 2026, 20:15 (ora României)",
    url: "https://centruldearabalibaneza.com/checkout?courseType=group",
    lang: "ro",
  },
} satisfies TemplateEntry;

const deadlineText = {
  fontSize: "17px",
  fontWeight: "700" as const,
  color: "#1a1a2e",
  margin: "0 0 16px",
};
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
const textSmall = {
  fontSize: "12px",
  color: "#888",
  lineHeight: "1.5",
  margin: "12px 0",
  wordBreak: "break-all" as const,
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
const link = { color: "#dc2626", textDecoration: "underline" };
const hr = { borderColor: "#e5e5e5", margin: "28px 0 20px" };
const footer = { fontSize: "14px", color: "#666", margin: "0 0 4px" };
const logoMark = {
  display: "inline-block",
  verticalAlign: "middle",
  borderRadius: "5px",
  marginRight: "8px",
};
