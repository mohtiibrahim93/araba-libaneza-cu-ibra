import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'Arabă Libaneză cu Ibra'
const BASE = 'https://centruldearabalibaneza.com'

interface Props {
  name?: string
  downloadUrl?: string
  trialUrl?: string
}

const Email = ({
  name,
  downloadUrl = `${BASE}/100-expresii-libaneze.pdf`,
  trialUrl = `${BASE}/trial`,
}: Props) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>100 de expresii libaneze esențiale — PDF-ul tău e aici</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={logo}>🌳 {SITE_NAME}</Text></Section>
        <Heading style={h1}>{name ? `Salut, ${name}!` : 'Salut!'}</Heading>
        <Text style={text}>
          Mai jos ai pachetul de start: 100 de expresii libaneze esențiale, grupate pe situații
          (salut și prezentare, restaurant, taxi, cumpărături, familie, urări), fiecare scrisă în
          arabizi și tradusă în română.
        </Text>
        <Section style={ctaSection}>
          <Button style={button} href={downloadUrl}>Descarcă cele 100 de expresii (PDF)</Button>
        </Section>
        <Text style={textSmall}><Link href={downloadUrl} style={link}>{downloadUrl}</Link></Text>
        <Hr style={hr} />
        <Text style={text}>
          Sfat: învață 5 expresii pe zi și folosește-le cu voce tare. În 20 de zile le ai pe toate.
          Când vrei să le testezi într-o conversație reală, prima lecție cu profesor nativ e gratuită.
        </Text>
        <Section style={ctaSection}>
          <Button style={buttonGhost} href={trialUrl}>Rezervă lecția de probă gratuită</Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Pe curând, {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: '100 de expresii libaneze esențiale (PDF)',
  displayName: 'Resursă — 100 de expresii libaneze',
  previewData: {
    name: 'Maria',
    downloadUrl: `${BASE}/100-expresii-libaneze.pdf`,
    trialUrl: `${BASE}/trial`,
  },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#f6f6f6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container: React.CSSProperties = { backgroundColor: '#ffffff', margin: '0 auto', padding: '24px', maxWidth: '560px', borderRadius: '8px' }
const headerSection: React.CSSProperties = { textAlign: 'center', marginBottom: '8px' }
const logo: React.CSSProperties = { fontSize: '15px', fontWeight: 700, color: '#b91c1c', margin: 0 }
const h1: React.CSSProperties = { fontSize: '22px', fontWeight: 700, color: '#111827', margin: '12px 0' }
const text: React.CSSProperties = { fontSize: '15px', lineHeight: '24px', color: '#374151' }
const textSmall: React.CSSProperties = { fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }
const ctaSection: React.CSSProperties = { textAlign: 'center', margin: '20px 0' }
const button: React.CSSProperties = { backgroundColor: '#b91c1c', color: '#ffffff', padding: '12px 22px', borderRadius: '6px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }
const buttonGhost: React.CSSProperties = { backgroundColor: '#111827', color: '#ffffff', padding: '11px 20px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }
const link: React.CSSProperties = { color: '#b91c1c' }
const hr: React.CSSProperties = { borderColor: '#e5e7eb', margin: '20px 0' }
const footer: React.CSSProperties = { fontSize: '13px', color: '#6b7280' }
