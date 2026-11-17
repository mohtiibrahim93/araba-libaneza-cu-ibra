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
 * A student sent a withdrawal, a cancellation or a request to move from
 * "Contul meu" (owner, 17 Nov 2026). Tells the owner who, when, what they
 * were shown, and what is left to do in the admin. Sent by student-cancel.
 */
interface Shown {
  case?: string;
  paidLei?: number;
  backLei?: number;
  creditLei?: number;
  keptLei?: number;
  cancelFeeLei?: number;
  stripeFee?: boolean;
  certain?: boolean;
}
interface Props {
  kind?: "withdrawal" | "cancellation" | "transfer";
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  target?: string;
  statement?: string;
  when?: string;
  shown?: Shown | null;
  /** true: stopped; false: could not be stopped; null: no card subscription. */
  subscriptionStopped?: boolean | null;
  acknowledged?: boolean;
}

const LABEL = {
  withdrawal: "Retragere din contract (14 zile)",
  cancellation: "Anulare",
  transfer: "Cerere de mutare în altă grupă",
} as const;

const lei = (n: number | undefined) =>
  `${new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: Number.isInteger(n ?? 0) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0)} lei`;

const Email = ({
  kind = "cancellation",
  name,
  email,
  phone,
  course,
  target,
  statement,
  when,
  shown,
  subscriptionStopped,
  acknowledged,
}: Props) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>
      {LABEL[kind]}: {name || "un cursant"}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{LABEL[kind]}</Heading>
        <Text style={text}>
          <strong>{name || "Un cursant"}</strong>
          {email ? ` (${email}${phone ? `, ${phone}` : ""})` : ""} a trimis din
          Contul meu, pe {when || "?"}, pentru {course || "cursul său"}:
        </Text>
        <Text style={quote}>{statement}</Text>
        {kind === "transfer" ? (
          <Text style={text}>
            Vrea să se mute în {target || "altă grupă"}. Confirmă-i mutarea
            (Fișa › Mută în altă grupă) sau scrie-i.
          </Text>
        ) : shown && shown.certain === false ? (
          <Text style={text}>
            Lecțiile grupei nu sunt toate în sistem, așa că nu i s-a arătat o
            sumă. Calculează-o tu, după Termeni (secțiunea 4).
          </Text>
        ) : shown ? (
          <Text style={text}>
            I s-a arătat: plătit {lei(shown.paidLei)} · înapoi{" "}
            {lei(shown.backLei)}
            {shown.stripeFee ? " (minus comisionul Stripe)" : ""} · credit{" "}
            {lei(shown.creditLei)} · lecții ținute, păstrate{" "}
            {lei(shown.keptLei)}
            {shown.cancelFeeLei
              ? ` · taxa de 10%: ${lei(shown.cancelFeeLei)}`
              : ""}
            .
          </Text>
        ) : null}
        {subscriptionStopped === true && (
          <Text style={text}>
            Abonamentul cu cardul a fost oprit: după luna în curs nu se mai
            încasează nimic.
          </Text>
        )}
        {subscriptionStopped === false && (
          <Text style={warn}>
            Abonamentul cu cardul NU a putut fi oprit. Oprește-l din admin
            (Anulează abonament).
          </Text>
        )}
        {acknowledged === false && (
          <Text style={warn}>
            Confirmarea pe email către cursant NU a plecat. Trimite-i-o tu, cu
            textul de mai sus și data și ora trimiterii.
          </Text>
        )}
        <Text style={text}>
          Rezolvă cererea în admin (Acasă › De rezolvat). Termenul din Termeni:
          14 zile de la data de mai sus.
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
    `${LABEL[d.kind ?? "cancellation"] ?? LABEL.cancellation}: ${d.name || "cursant"}${d.course ? ` — ${d.course}` : ""}`,
  to: "marhaba@centruldearabalibaneza.com",
  displayName: "Notificare admin — retragere / anulare / mutare din Contul meu",
  previewData: {
    kind: "cancellation",
    name: "Ana Exemplu",
    email: "ana@example.com",
    phone: "+40 700 000 000",
    course: "Curs de grup · A1 · online",
    statement:
      "Anulez locul meu la „Curs de grup · A1 · online”, la care m-am înscris pe 2 septembrie 2026.",
    when: "24 noiembrie 2026, ora 14:05 (ora României)",
    shown: {
      case: "after_test_lessons",
      paidLei: 1500,
      backLei: 500,
      creditLei: 312.5,
      keptLei: 0,
      cancelFeeLei: 0,
      stripeFee: false,
      certain: true,
    },
    subscriptionStopped: null,
    acknowledged: true,
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
const quote = {
  ...text,
  color: "#1a1a2e",
  borderLeft: "3px solid #e5e5e5",
  paddingLeft: "12px",
};
const warn = { ...text, color: "#b91c1c", fontWeight: "600" as const };
const hr = { borderColor: "#e5e5e5", margin: "28px 0 20px" };
const footer = { fontSize: "12px", color: "#888", margin: "0" };
