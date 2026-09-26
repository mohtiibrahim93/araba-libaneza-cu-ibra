import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'Arabă Libaneză cu Ibra'
const SITE_TAGLINE = 'Centrul de Arabă Libaneză'

interface KidsRegistrationConfirmationProps {
  name?: string
  childName?: string
  childAge?: string
  message?: string
  senderName?: string
  scheduleLabel?: string
  icsUrl?: string
  manageUrl?: string
}

const KidsRegistrationConfirmationEmail = ({ name, childName, childAge, message, senderName, scheduleLabel, icsUrl, manageUrl }: KidsRegistrationConfirmationProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Am primit cererea pentru cursul de copii.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logo}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />{SITE_NAME}</Text>
          <Text style={tagline}>{SITE_TAGLINE}</Text>
        </Section>
        <Heading style={h1}>{name ? `Mulțumim, ${name}!` : 'Mulțumim!'}</Heading>
        <Text style={text}>Am primit cererea pentru cursul de arabă libaneză pentru copii.</Text>
        <Section style={detailsBox}>
          <Text style={infoTitle}>📚 Detaliile cursului</Text>
          <Text style={infoText}><strong>Tip:</strong> Curs copii</Text>
          {childName && <Text style={infoText}>Nume copil: {childName}</Text>}
          {childAge && <Text style={infoText}>Vârstă copil: {childAge}</Text>}
          <Text style={infoText}><strong>Format:</strong> fizic, în București</Text>
          {scheduleLabel && <Text style={infoText}><strong>Program:</strong> {scheduleLabel}</Text>}
          <Text style={infoText}><strong>Activități:</strong> jocuri, cântece și activități creative</Text>
          {message && <Text style={infoText}>Observații: {message}</Text>}
        </Section>
        <Section style={infoBox}>
          <Text style={infoTitle}>✅ Următorii pași</Text>
          <Text style={checkItem}>1. Te contactăm pe WhatsApp pentru confirmare</Text>
          <Text style={checkItem}>2. Confirmăm grupa potrivită pentru copil</Text>
          <Text style={checkItem}>3. Stabilim detaliile practice și plata</Text>
          <Text style={checkItem}>4. Începem cursul 🎉</Text>
        </Section>
        <Section style={ctaSection}>
          <Button style={button} href="https://wa.me/40763124514">Contactează-ne pe WhatsApp</Button>
          {icsUrl && (
            <Text style={textSmall}>📅 <Link href={icsUrl} style={link}>Adaugă în calendar (.ics)</Link></Text>
          )}
          {manageUrl && (
            <Text style={textSmall}>⚙️ <Link href={manageUrl} style={link}>Gestionează înscrierea</Link></Text>
          )}
        </Section>
        <Hr style={hr} />
        <Section style={footerBrand}><Text style={footerLogo}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />{senderName || SITE_NAME}</Text></Section>
        <Text style={footer}>Cu drag, echipa noastră</Text>
        <Text style={footerSmall}>📍 București, România · 📞 +40 763 124 514 · 🌐 centruldearabalibaneza.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: KidsRegistrationConfirmationEmail,
  subject: 'Confirmare cerere curs copii',
  displayName: 'Confirmare curs copii',
  previewData: { name: 'Ana Popescu', childName: 'Maya', childAge: '8 ani', message: 'Îi plac cântecele și activitățile creative.', scheduleLabel: 'sâmbătă, 11:00–12:00', icsUrl: 'https://example.com/ics?id=abc' },
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
const infoBox = { backgroundColor: '#fef2f2', borderRadius: '12px', padding: '20px', margin: '24px 0' }
const infoTitle = { fontSize: '15px', fontWeight: '600' as const, color: '#1a1a2e', margin: '0 0 12px' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.5', margin: '0 0 6px' }
const checkItem = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 8px' }
const link = { color: '#dc2626', textDecoration: 'underline', wordBreak: 'break-all' as const }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#25D366', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footerBrand = { textAlign: 'center' as const, margin: '0 0 8px' }
const footerLogo = { fontSize: '14px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }
const logoMark = { display: 'inline-block', verticalAlign: 'middle', borderRadius: '5px', marginRight: '8px' }
