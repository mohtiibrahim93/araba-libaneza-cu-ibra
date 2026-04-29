import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'centrul de araba libaneza'

interface PrivateRegistrationConfirmationProps {
  name?: string
  format?: string
  message?: string
  statusUrl?: string
  senderName?: string
}

const formatLabels: Record<string, string> = { fizic: 'fizic, în București', online: 'online' }

const PrivateRegistrationConfirmationEmail = ({ name, format, message, statusUrl, senderName }: PrivateRegistrationConfirmationProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Am primit cererea ta pentru lecții private.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={logo}>🌳 {SITE_NAME}</Text></Section>
        <Heading style={h1}>{name ? `Mulțumim, ${name}!` : 'Mulțumim!'}</Heading>
        <Text style={text}>Am primit cererea ta pentru lecții private individuale de arabă libaneză.</Text>
        <Section style={detailsBox}>
          <Text style={infoTitle}>Detaliile cererii:</Text>
          {format && <Text style={infoText}>Format preferat: {formatLabels[format] || format}</Text>}
          <Text style={infoText}>Durată sesiune: 90 minute</Text>
          <Text style={infoText}>Program: flexibil, stabilit împreună</Text>
          {message && <Text style={infoText}>Mesaj: {message}</Text>}
          {statusUrl && <Text style={infoText}>Status cerere: <Link href={statusUrl} style={link}>vezi stadiul aici</Link></Text>}
        </Section>
        <Section style={infoBox}>
          <Text style={infoTitle}>Următorii pași:</Text>
          <Text style={infoText}>Te vom contacta pe telefon sau WhatsApp pentru obiective, disponibilitate și prima sesiune.</Text>
        </Section>
        <Section style={ctaSection}><Button style={button} href={statusUrl || 'https://wa.me/40763124514'}>{statusUrl ? 'Vezi statusul cererii' : 'Contactează-ne pe WhatsApp'}</Button></Section>
        <Hr style={hr} />
        <Text style={footer}>Cu drag, echipa {senderName || SITE_NAME}</Text>
        <Text style={footerSmall}>📍 București, România | 📞 +40 763 124 514</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PrivateRegistrationConfirmationEmail,
  subject: 'Confirmare cerere lecții private',
  displayName: 'Confirmare lecții private',
  previewData: { name: 'Maria Popescu', format: 'online', message: 'Prefer seara, după ora 18:00.', statusUrl: 'https://example.com/private-status/exemplu' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '20px 0 10px' }
const logo = { fontSize: '18px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '20px 0' }
const infoBox = { backgroundColor: '#fef2f2', borderRadius: '12px', padding: '20px', margin: '24px 0' }
const infoTitle = { fontSize: '15px', fontWeight: '600' as const, color: '#1a1a2e', margin: '0 0 12px' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.5', margin: '0 0 6px' }
const link = { color: '#dc2626', textDecoration: 'underline' }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#25D366', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }
