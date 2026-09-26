import * as React from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  accessUrl?: string;
  lang?: "ro" | "en";
}

const COPY = {
  ro: {
    preview: "Linkul tău privat pentru rezervări",
    title: "Rezervările tale",
    body: "Ai cerut acces la rezervările asociate acestei adrese de email.",
    cta: "Vezi rezervările",
    expiry: "Linkul este privat și expiră în 30 de minute. Nu îl transmite altor persoane.",
    ignore: "Dacă nu ai cerut acest link, poți ignora mesajul.",
  },
  en: {
    preview: "Your private bookings link",
    title: "Your bookings",
    body: "You requested access to the bookings associated with this email address.",
    cta: "View my bookings",
    expiry: "This private link expires in 30 minutes. Do not share it with anyone.",
    ignore: "If you did not request this link, you can ignore this email.",
  },
} as const;

const BookingsAccessEmail = ({ accessUrl, lang = "ro" }: Props) => {
  const c = COPY[lang];
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{c.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />Arabă Libaneză cu Ibra</Text>
          <Heading style={heading}>{c.title}</Heading>
          <Text style={text}>{c.body}</Text>
          {accessUrl && (
            <Section style={ctaSection}>
              <Button href={accessUrl} style={button}>{c.cta}</Button>
            </Section>
          )}
          {accessUrl && <Text style={small}><Link href={accessUrl} style={link}>{accessUrl}</Link></Text>}
          <Text style={notice}>{c.expiry}</Text>
          <Hr style={hr} />
          <Text style={small}>{c.ignore}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: BookingsAccessEmail,
  subject: (data: Props) => data.lang === "en" ? "Your private bookings link" : "Linkul tău privat pentru rezervări",
  displayName: "Rezervări — link privat",
  previewData: { accessUrl: "https://centruldearabalibaneza.com/rezervari?token=example", lang: "ro" },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Inter, Arial, sans-serif" };
const container = { margin: "0 auto", maxWidth: "560px", padding: "32px 24px" };
const brand = { color: "#1a1a2e", fontSize: "17px", fontWeight: "700" as const };
const heading = { color: "#1a1a2e", fontSize: "26px", lineHeight: "1.3", margin: "24px 0 12px" };
const text = { color: "#4a4a5a", fontSize: "15px", lineHeight: "1.6" };
const ctaSection = { margin: "28px 0", textAlign: "center" as const };
const button = { backgroundColor: "#dc2626", borderRadius: "8px", color: "#ffffff", display: "inline-block", fontSize: "15px", fontWeight: "600" as const, padding: "14px 28px", textDecoration: "none" };
const link = { color: "#dc2626", textDecoration: "underline" };
const notice = { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#4a4a5a", fontSize: "13px", lineHeight: "1.5", padding: "14px" };
const small = { color: "#777777", fontSize: "12px", lineHeight: "1.5", wordBreak: "break-all" as const };
const hr = { borderColor: "#e5e5e5", margin: "28px 0 20px" };
const logoMark = { display: "inline-block", verticalAlign: "middle", borderRadius: "5px", marginRight: "8px" };
