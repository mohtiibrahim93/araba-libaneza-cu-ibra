import * as React from 'react'
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface AdminContactMessageProps {
  name?: string
  email?: string
  phone?: string
  language?: string
  message?: string
}

const LANGUAGE_LABEL: Record<string, string> = {
  ro: 'Română (/contact)',
  en: 'Engleză (/en/contact)',
}

/**
 * Sent to the school inbox whenever someone uses the contact form. The
 * visitor's address is set as Reply-To by the sending route, so hitting
 * "Reply" on a phone answers the person directly.
 */
const AdminContactMessageEmail = ({ name, email, phone, language, message }: AdminContactMessageProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>{`Mesaj nou de contact: ${name || 'vizitator'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✉️ Mesaj nou din formularul de contact</Heading>
        <Text style={text}>Poți răspunde direct la acest email — ajunge la expeditor.</Text>
        <Section style={detailsBox}>
          {name && <Text style={infoText}><strong>Nume:</strong> {name}</Text>}
          {email && (
            <Text style={infoText}>
              <strong>Email:</strong> <Link href={`mailto:${email}`} style={link}>{email}</Link>
            </Text>
          )}
          {phone && (
            <Text style={infoText}>
              <strong>Telefon:</strong> <Link href={`tel:${phone.replace(/[^+\d]/g, '')}`} style={link}>{phone}</Link>
            </Text>
          )}
          {language && <Text style={infoText}><strong>Pagina:</strong> {LANGUAGE_LABEL[language] ?? language}</Text>}
        </Section>
        <Section style={messageBox}>
          <Text style={messageLabel}>Mesaj</Text>
          <Text style={messageText}>{message}</Text>
        </Section>
        <Hr style={hr} />
        <Text style={footerSmall}>Notificare automată — centruldearabalibaneza.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminContactMessageEmail,
  subject: (data: Record<string, any>) =>
    `Mesaj nou de contact: ${data?.['name'] || 'vizitator'}`,
  displayName: 'Notificare admin — mesaj de contact',
  to: 'marhaba@centruldearabalibaneza.com',
  previewData: {
    name: 'Maria Popescu',
    email: 'maria@example.com',
    phone: '+40 712 345 678',
    language: 'ro',
    message: 'Bună! Vreau să știu când începe următoarea grupă de nivel A1 online.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 12px' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '16px 0' }
const messageBox = { backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '0 0 16px' }
const messageLabel = { fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.04em', color: '#999', margin: '0 0 8px' }
const messageText = { fontSize: '15px', color: '#1a1a2e', lineHeight: '1.7', margin: '0', whiteSpace: 'pre-wrap' as const }
const infoText = { fontSize: '14px', color: '#1a1a2e', lineHeight: '1.6', margin: '0 0 6px' }
const link = { color: '#c8102e', textDecoration: 'underline' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0 12px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }
