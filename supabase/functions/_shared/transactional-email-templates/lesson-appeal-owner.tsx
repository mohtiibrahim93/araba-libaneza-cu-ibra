import * as React from "npm:react@19.3.0";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@1.0.12";
import type { TemplateEntry } from "./registry.ts";

/**
 * To the owner (26 October 2026): a student contests a lesson counted as
 * lost (no-show or late cancellation). The owner answers within 24 hours,
 * from Acasă (Scuzat / Pierdută) or on WhatsApp.
 */
interface Props {
  /** Still unanswered 20 hours later: the one reminder. */
  reminder?: boolean;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string | null;
  whenLabel?: string;
  lessonLabel?: string | null;
  appealText?: string;
  whatsappUrl?: string | null;
  adminUrl?: string;
}

const Email = ({
  reminder,
  studentName,
  studentEmail,
  studentPhone,
  whenLabel,
  lessonLabel,
  appealText,
  whatsappUrl,
  adminUrl,
}: Props) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>{`Contestație: ${studentName || "cursant"} — lecția din ${whenLabel ?? ""}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {reminder
            ? "⏰ Mai ai ~4 ore să răspunzi"
            : "✋ Cerere de reconsiderare"}
        </Heading>
        <Text style={text}>
          Cursantul spune că lecția nu ar trebui să se numere din pachet.
          Răspunde-i în 24 de ore: Scuzat (nu se numără) sau Pierdută (se
          numără).
        </Text>
        <Section style={detailsBox}>
          <Text style={infoText}>
            <strong>Cursant:</strong> {studentName}
          </Text>
          {studentEmail && (
            <Text style={infoText}>
              <strong>Email:</strong> {studentEmail}
            </Text>
          )}
          {studentPhone && (
            <Text style={infoText}>
              <strong>Telefon:</strong> {studentPhone}
            </Text>
          )}
          <Text style={infoText}>
            <strong>Lecția:</strong> {whenLabel}
            {lessonLabel ? ` (${lessonLabel})` : ""}
          </Text>
          <Text style={infoText}>
            <strong>Motivul:</strong> {appealText}
          </Text>
        </Section>
        <Section style={ctaSection}>
          {adminUrl && (
            <Button style={button} href={adminUrl}>
              Răspunde din Acasă
            </Button>
          )}
          {whatsappUrl && (
            <Text style={text}>
              <a href={whatsappUrl} style={link}>
                Scrie-i pe WhatsApp
              </a>
            </Text>
          )}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Notificare automată — centruldearabalibaneza.com
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (d: Props) =>
    `${d.reminder ? "Reamintire — " : ""}Contestație lecție: ${d.studentName || "cursant"} (${d.whenLabel ?? ""})`,
  displayName: "Admin — student appeals a lesson counted as lost",
  previewData: {
    studentName: "Ioan",
    studentEmail: "ioan@example.com",
    studentPhone: "+40 700 000 000",
    whenLabel: "12 nov. 2026, 18:00",
    lessonLabel: "L4/10",
    appealText: "Am fost internat în spital.",
    whatsappUrl: "https://wa.me/40700000000",
    adminUrl: "https://centruldearabalibaneza.com/admin",
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "'Inter', Arial, sans-serif",
};
const container = { padding: "20px 25px", maxWidth: "560px", margin: "0 auto" };
const h1 = {
  fontSize: "22px",
  fontWeight: "700" as const,
  color: "#1a1a2e",
  margin: "20px 0 16px",
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
  margin: "0 0 8px",
};
const ctaSection = { textAlign: "center" as const, margin: "24px 0" };
const button = {
  backgroundColor: "#166534",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600" as const,
  textDecoration: "none",
  display: "inline-block",
};
const link = { color: "#166534", fontWeight: "600" as const };
const hr = { borderColor: "#e5e5e5", margin: "28px 0 20px" };
const footer = { fontSize: "12px", color: "#888", margin: "0" };
