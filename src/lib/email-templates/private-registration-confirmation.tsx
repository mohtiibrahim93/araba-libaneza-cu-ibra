import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'Arabă Libaneză cu Ibra'
const SITE_TAGLINE = 'Centrul de Arabă Libaneză'

interface PrivateRegistrationConfirmationProps {
  name?: string
  format?: string
  message?: string
  statusUrl?: string
  senderName?: string
  zoomLink?: string
  manageUrl?: string
}

const formatLabels: Record<string, string> = { fizic: 'fizic, în București', online: 'online' }

const PrivateRegistrationConfirmationEmail = ({ name, format, message, statusUrl, senderName, zoomLink, manageUrl }: PrivateRegistrationConfirmationProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Am primit cererea ta pentru lecții private.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logo}>🌳 {SITE_NAME}</Text>
          <Text style={tagline}>{SITE_TAGLINE}</Text>
        </Section>
        <Heading style={h1}>{name ? `Mulțumim, ${name}!` : 'Mulțumim!'}</Heading>
        <Text style={text}>Am primit cererea ta pentru lecții private individuale de arabă libaneză.</Text>
        <Section style={detailsBox}>
          <Text style={infoTitle}>📚 Detaliile cursului</Text>
          <Text style={infoText}><strong>Tip:</strong> Lecții private (1:1)</Text>
          {format && <Text style={infoText}>Format preferat: {formatLabels[format] || format}</Text>}
          <Text style={infoText}><strong>Durată sesiune:</strong> 90 minute</Text>
          <Text style={infoText}><strong>Program:</strong> flexibil, stabilit împreună</Text>
          {message && <Text style={infoText}>Mesaj: {message}</Text>}
          {statusUrl && <Text style={infoText}>Status cerere: <Link href={statusUrl} style={link}>vezi stadiul aici</Link></Text>}
        </Section>

        {zoomLink && format === 'online' && (
          <Section style={zoomBox}>
            <Text style={infoTitle}>🎥 Link Zoom</Text>
            <Text style={infoText}><Link href={zoomLink} style={link}>{zoomLink}</Link></Text>
            <Text style={infoTextSmall}>Salvează acest link pentru sesiunile online.</Text>
          </Section>
        )}

        <Section style={infoBox}>
          <Text style={infoTitle}>✅ Următorii pași</Text>
          <Text style={checkItem}>1. Te contactăm pe WhatsApp pentru obiective și disponibilitate</Text>
          <Text style={checkItem}>2. Stabilim împreună programul</Text>
          <Text style={checkItem}>3. Confirmi plata pentru prima sesiune</Text>
          <Text style={checkItem}>4. Începem prima lecție 🎉</Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={button} href={statusUrl || 'https://wa.me/40763124514'}>{statusUrl ? 'Vezi statusul cererii' : 'Contactează-ne pe WhatsApp'}</Button>
          {manageUrl && (
            <Text style={textSmall}>⚙️ <Link href={manageUrl} style={link}>Gestionează înscrierea</Link></Text>
          )}
        </Section>
        <Hr style={hr} />
        <Section style={footerBrand}><Text style={footerLogo}>🌳 {senderName || SITE_NAME}</Text></Section>
        <Text style={footer}>Cu drag, echipa noastră</Text>
        <Text style={footerSmall}>📍 București, România · 📞 +40 763 124 514 · 🌐 centruldearabalibaneza.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PrivateRegistrationConfirmationEmail,
  subject: 'Confirmare cerere lecții private',
  displayName: 'Confirmare lecții private',
  previewData: { name: 'Maria Popescu', format: 'online', message: 'Prefer seara, după ora 18:00.', statusUrl: 'https://example.com/private-status/exemplu', zoomLink: 'https://us02web.zoom.us/j/1234567890' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '24px 0 16px', borderBottom: '3px solid #dc2626', marginBottom: '8px' }
const logo = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const tagline = { fontSize: '12px', color: '#888', margin: '4px 0 0', letterSpacing: '0.5px', textTransform: 'uppercase' as const }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const textSmall = { fontSize: '13px', color: '#4a4a5a', lineHeight: '1.6', margin: '8px 0', textAlign: 'center' as const }
const detailsBox = { backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '20px 0' }
const zoomBox = { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '18px', margin: '16px 0' }
const infoBox = { backgroundColor: '#fef2f2', borderRadius: '12px', padding: '20px', margin: '24px 0' }
const infoTitle = { fontSize: '15px', fontWeight: '600' as const, color: '#1a1a2e', margin: '0 0 12px' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.5', margin: '0 0 6px' }
const infoTextSmall = { fontSize: '12px', color: '#888', lineHeight: '1.5', margin: '6px 0 0' }
const checkItem = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 8px' }
const link = { color: '#dc2626', textDecoration: 'underline', wordBreak: 'break-all' as const }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#25D366', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footerBrand = { textAlign: 'center' as const, margin: '0 0 8px' }
const footerLogo = { fontSize: '14px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }
