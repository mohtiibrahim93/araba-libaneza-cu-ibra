import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface AdminNewRegistrationProps {
  name?: string
  phone?: string
  email?: string
  formType?: string
  format?: string
  center?: string
  notes?: string
}

const AdminNewRegistrationEmail = ({ name, phone, email, formType, format, center, notes }: AdminNewRegistrationProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Înscriere nouă: {name || 'cursant'} ({formType || ''})</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📝 Înscriere nouă</Heading>
        <Text style={text}>Un cursant nou a completat formularul de pe site.</Text>
        <Section style={detailsBox}>
          {formType && <Text style={infoText}><strong>Tip curs:</strong> {formType}</Text>}
          {name && <Text style={infoText}><strong>Nume:</strong> {name}</Text>}
          {phone && <Text style={infoText}><strong>Telefon:</strong> {phone}</Text>}
          {email && <Text style={infoText}><strong>Email:</strong> {email}</Text>}
          {format && <Text style={infoText}><strong>Format:</strong> {format}</Text>}
          {center && <Text style={infoText}><strong>Locație:</strong> {center}</Text>}
          {notes && <Text style={infoText}><strong>Detalii:</strong> {notes}</Text>}
        </Section>
        <Hr style={hr} />
        <Text style={footerSmall}>Notificare automată — centruldearabalibaneza.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNewRegistrationEmail,
  subject: (data: Record<string, any>) => `Înscriere nouă: ${data?.['name'] || 'cursant'}${data?.['formType'] ? ` (${data['formType']})` : ''}`,
  displayName: 'Notificare admin — înscriere nouă',
  previewData: { name: 'Maria Popescu', phone: '+40 712 345 678', email: 'maria@example.com', formType: 'Grup', format: 'online', center: 'Online', notes: 'Nivel: A1' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 12px' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '16px 0' }
const infoText = { fontSize: '14px', color: '#1a1a2e', lineHeight: '1.6', margin: '0 0 6px' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0 12px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }