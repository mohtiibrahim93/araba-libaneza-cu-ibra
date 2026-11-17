import * as React from "npm:react@19.3.1";
import { Section, Text } from "npm:@react-email/components@1.0.12";
import {
  MODEL_FORM_USE,
  MODEL_WITHDRAWAL_FORM,
  WITHDRAWAL_PARAGRAPH,
} from "../withdrawal-info.ts";
import type { EmailLanguage } from "./language.ts";

/**
 * The right of withdrawal in the sign-up confirmation (owner, 17 Nov 2026:
 * the lawyer's draft dropped, "apply the proposed things"): the Terms' 14-day
 * paragraph word for word, then the model withdrawal form, so the student
 * keeps them in the email itself, not behind a link (the confirmation on a
 * durable medium of Directive 2011/83/EU, art. 8(7)).
 */
export const WithdrawalSection = ({ lang }: { lang: EmailLanguage }) => {
  const form = MODEL_WITHDRAWAL_FORM[lang];
  return (
    <Section style={box}>
      <Text style={text}>{WITHDRAWAL_PARAGRAPH[lang]}</Text>
      <Text style={text}>{MODEL_FORM_USE[lang]}</Text>
      <Text style={title}>{form.title}</Text>
      <Text style={small}>{form.note}</Text>
      {form.lines.map((line) => (
        <Text key={line} style={small}>
          — {line}
        </Text>
      ))}
      <Text style={small}>{form.footnote}</Text>
    </Section>
  );
};

const box = {
  border: "1px solid #e5e5e5",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "24px 0 0",
};
const text = {
  fontSize: "13px",
  color: "#4a4a5a",
  lineHeight: "1.55",
  margin: "0 0 10px",
};
const title = {
  fontSize: "13px",
  fontWeight: "700" as const,
  color: "#1a1a2e",
  margin: "12px 0 4px",
};
const small = {
  fontSize: "12px",
  color: "#4a4a5a",
  lineHeight: "1.5",
  margin: "0 0 4px",
};
