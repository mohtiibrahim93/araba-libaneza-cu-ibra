import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Arabă Libaneză cu Ibra'
const SITE_TAGLINE = 'Centrul de Arabă Libaneză'

interface GroupRegistrationConfirmationProps {
  name?: string
  format?: string
  center?: string
  level?: string
  message?: string
  senderName?: string
  scheduleLabel?: string
  startDateLabel?: string
  zoomLink?: string
  icsUrl?: string
  manageUrl?: string
}

const formatLabels: Record<string, string> = { fizic: 'fizic, în București', online: 'online' }
const centerLabels: Record<string, string> = { bucuresti: 'Raduga Creative Center, Strada Icoanei 80, București', online: 'Online' }

// Keep in sync with the site (i18n programGroupDuration / curriculum.ts).
const durationByLevel: Record<string, string> = {
  A1: 'aproximativ 3 luni · 32 de lecții',
  A2: 'aproximativ 6 luni · 54 de lecții',
}
const durationLabel = (level?: string) =>
  durationByLevel[(level || '').trim().toUpperCase()] || 'A1: ~3 luni (32 de lecții) · A2: ~6 luni (54 de lecții)'

const GroupRegistrationConfirmationEmail = ({ name, format, center, level, message, senderName, scheduleLabel, startDateLabel, zoomLink, icsUrl, manageUrl }: GroupRegistrationConfirmationProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Am primit cererea ta pentru cursul de grup.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logo}>🌳 {SITE_NAME}</Text>
          <Text style={tagline}>{SITE_TAGLINE}</Text>
        </Section>
        <Heading style={h1}>{name ? `Mulțumim, ${name}!` : 'Mulțumim!'}</Heading>
        <Text style={text}>Am primit cererea ta pentru cursul de grup de arabă libaneză.</Text>
        <Section style={detailsBox}>
          <Text style={infoTitle}>📚 Detaliile cursului</Text>
          <Text style={infoText}><strong>Tip:</strong> Curs de grup</Text>
          {level && <Text style={infoText}>Nivel: {level}</Text>}
          {format && <Text style={infoText}>Format preferat: {formatLabels[format] || format}</Text>}
          {center && <Text style={infoText}>Locație: {centerLabels[center] || center}</Text>}
          <Text style={infoText}><strong>Durată:</strong> {durationLabel(level)}</Text>
          <Text style={infoText}><strong>Program:</strong> {scheduleLabel || 'marți și joi, 19:00–20:30'}</Text>
          {startDateLabel && <Text style={infoText}><strong>Start:</strong> {startDateLabel}</Text>}
          {message && <Text style={infoText}>Mesaj: {message}</Text>}
        </Section>

        {zoomLink && (
          <Section style={zoomBox}>
            <Text style={infoTitle}>🎥 Link Zoom (lecții online)</Text>
            <Text style={infoText}>
              <Link href={zoomLink} style={link}>{zoomLink}</Link>
            </Text>
            <Text style={infoTextSmall}>Salvează acest link — îl vei folosi pentru toate lecțiile online.</Text>
          </Section>
        )}

        <Section style={infoBox}>
          <Text style={infoTitle}>✅ Următorii pași</Text>
          <Text style={checkItem}>1. Te contactăm pe WhatsApp pentru confirmarea locului</Text>
          <Text style={checkItem}>2. Confirmăm programul și formatul (fizic/online)</Text>
          <Text style={checkItem}>3. Efectuezi plata (card, transfer sau cash)</Text>
          <Text style={checkItem}>4. Începem cursul împreună 🎉</Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={button} href="https://wa.me/40763124514">Contactează-ne pe WhatsApp</Button>
          {icsUrl && (
            <Text style={textSmall}>
              📅 <Link href={icsUrl} style={link}>Adaugă în calendar (.ics)</Link>
            </Text>
          )}
          {manageUrl && (
            <Text style={textSmall}>
              ⚙️ <Link href={manageUrl} style={link}>Gestionează înscrierea</Link>
            </Text>
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
  component: GroupRegistrationConfirmationEmail,
  subject: 'Confirmare cerere curs de grup',
  displayName: 'Confirmare curs de grup',
  previewData: { name: 'Maria Popescu', format: 'online', center: 'online', level: 'A1', scheduleLabel: 'marți și joi, 19:00–20:30', startDateLabel: '12 iun. 2026', zoomLink: 'https://us02web.zoom.us/j/1234567890', icsUrl: 'https://example.com/ics?id=abc', manageUrl: 'https://example.com/manage/abc' },
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
