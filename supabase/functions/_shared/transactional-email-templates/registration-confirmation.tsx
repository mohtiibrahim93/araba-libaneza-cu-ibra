import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Arabă Libaneză cu Ibra"

interface RegistrationConfirmationProps {
  name?: string
  formType?: string
  level?: string
}

const formTypeLabels: Record<string, string> = {
  group: 'Curs de Grup',
  private: 'Lecții Private',
  kids: 'Cursuri pentru Copii',
}

const RegistrationConfirmationEmail = ({ name, formType, level }: RegistrationConfirmationProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Mulțumim pentru înscrierea ta la {SITE_NAME}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logo}>🌳 {SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>
          {name ? `Bine ai venit, ${name}!` : 'Bine ai venit!'}
        </Heading>

        <Text style={text}>
          Mulțumim pentru înscrierea ta la {formType ? formTypeLabels[formType] || formType : 'cursurile noastre'}
          {level ? ` — Nivel ${level}` : ''}.
        </Text>

        <Text style={text}>
          Am primit cererea ta și te vom contacta în curând cu toate detaliile necesare 
          pentru a începe călătoria ta de învățare a limbii arabe libaneze.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>📋 Următorii pași:</Text>
          <Text style={infoText}>1. Te vom contacta pe WhatsApp sau email</Text>
          <Text style={infoText}>2. Confirmăm detaliile cursului și programul</Text>
          <Text style={infoText}>3. Efectuezi plata (card, transfer sau cash)</Text>
          <Text style={infoText}>4. Începi cursul! 🎉</Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={button} href="https://wa.me/40763124514">
            Contactează-ne pe WhatsApp
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Cu drag, echipa {SITE_NAME}
        </Text>
        <Text style={footerSmall}>
          📍 București, România | 📞 +40 763 124 514
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: RegistrationConfirmationEmail,
  subject: 'Confirmare înscriere — Arabă Libaneză cu Ibra',
  displayName: 'Confirmare înscriere',
  previewData: { name: 'Maria', formType: 'group', level: 'A1' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '20px 0 10px' }
const logo = { fontSize: '18px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const infoBox = { backgroundColor: '#fef2f2', borderRadius: '12px', padding: '20px', margin: '24px 0' }
const infoTitle = { fontSize: '15px', fontWeight: '600' as const, color: '#1a1a2e', margin: '0 0 12px' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.5', margin: '0 0 6px' }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = {
  backgroundColor: '#25D366', color: '#ffffff', padding: '14px 28px',
  borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const,
  textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }
