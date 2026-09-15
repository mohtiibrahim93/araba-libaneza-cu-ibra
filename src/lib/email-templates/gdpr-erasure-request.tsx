import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface GdprErasureRequestProps {
  email?: string
  name?: string
  message?: string
  requestedAt?: string
}

const GdprErasureRequestEmail = ({ email, name, message, requestedAt }: GdprErasureRequestProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Cerere ștergere date (GDPR): {email || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🗑️ Cerere de ștergere a datelor (GDPR)</Heading>
        <Text style={text}>
          Un vizitator a cerut ștergerea datelor personale prin formularul de pe site.
          Conform GDPR, cererea trebuie rezolvată în cel mult 30 de zile: caută înscrierile
          după email în panoul de administrare și șterge-le, apoi confirmă-i persoanei pe email.
        </Text>
        <Section style={detailsBox}>
          {email && <Text style={infoText}><strong>Email:</strong> {email}</Text>}
          {name && <Text style={infoText}><strong>Nume:</strong> {name}</Text>}
          {message && <Text style={infoText}><strong>Mesaj:</strong> {message}</Text>}
          {requestedAt && <Text style={infoText}><strong>Data cererii:</strong> {requestedAt}</Text>}
        </Section>
        <Hr style={hr} />
        <Text style={footerSmall}>Notificare automată — centruldearabalibaneza.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: GdprErasureRequestEmail,
  subject: (data: Record<string, any>) => `Cerere ștergere date (GDPR): ${data?.email || 'necunoscut'}`,
  to: 'marhaba@centruldearabalibaneza.com',
  displayName: 'Notificare admin — cerere ștergere date (GDPR)',
  previewData: { email: 'maria@example.com', name: 'Maria Popescu', message: 'Vă rog să îmi ștergeți contul.', requestedAt: '10 iul. 2026, 14:30' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 12px' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '16px 0' }
const infoText = { fontSize: '14px', color: '#1a1a2e', lineHeight: '1.6', margin: '0 0 6px' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0 12px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }
