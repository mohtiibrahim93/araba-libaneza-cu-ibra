import * as React from "npm:react@19.3.1";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "npm:@react-email/components@1.0.12";
import type { TemplateEntry } from "./registry.ts";

/**
 * A group payment arrived after its seat hold ran out, and the group was full
 * by then (owner, 2 Nov 2026). The payment is accepted, never refunded
 * automatically; the group is over capacity and the owner decides.
 */
interface Props {
  name?: string;
  group?: string;
  taken?: number;
  maxSeats?: number;
  registrationId?: string;
}

const Email = ({ name, group, taken, maxSeats, registrationId }: Props) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Grupă peste capacitate după o plată întârziată</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Grupă peste capacitate</Heading>
        <Text style={text}>
          {name || "Un cursant"} a plătit pentru {group || "o grupă"} după ce
          locul ținut pentru el expirase, iar între timp grupa s-a ocupat. Plata
          a fost acceptată, nu s-a făcut nicio rambursare.
        </Text>
        <Text style={text}>
          <strong>Locuri ocupate:</strong> {taken ?? "?"} / {maxSeats ?? "?"}
        </Text>
        {registrationId && (
          <Text style={text}>
            <strong>ID înscriere:</strong> {registrationId}
          </Text>
        )}
        <Text style={text}>
          Decizia e a ta: păstrezi cursantul (grupa rămâne peste capacitate), îl
          muți în grupa următoare sau îi rambursezi plata din admin.
        </Text>
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
    `Grupă peste capacitate: ${d.group || "grupă"} (${d.taken ?? "?"}/${d.maxSeats ?? "?"})`,
  displayName: "Notificare admin — grupă peste capacitate",
  previewData: {
    name: "Maria Popescu",
    group: "grupa A1 online, în română, care începe pe 7 noiembrie 2026",
    taken: 7,
    maxSeats: 6,
    registrationId: "00000000-0000-0000-0000-000000000000",
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
  margin: "0 0 14px",
};
const hr = { borderColor: "#e5e5e5", margin: "28px 0 20px" };
const footer = { fontSize: "12px", color: "#888", margin: "0" };
