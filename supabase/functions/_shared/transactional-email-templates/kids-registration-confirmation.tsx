import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'centrul de araba libaneza'

interface KidsRegistrationConfirmationProps {
  name?: string
  childName?: string
  childAge?: string
  message?: string
  senderName?: string
}

const KidsRegistrationConfirmationEmail = ({ name, childName, childAge, message, senderName }: KidsRegistrationConfirmationProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Am primit cererea pentru cursul de copii.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={logo}>🌳 {SITE_NAME}</Text></Section>
        <Heading style={h1}>{name ? `Mulțumim, ${name}!` : 'Mulțumim!'}</Heading>
        <Text style={text}>Am primit cererea pentru cursul de arabă libaneză pentru copii.</Text>
        <Section style={detailsBox}>
          <Text style={infoTitle}>Detaliile cererii:</Text>
          {childName && <Text style={infoText}>Nume copil: {childName}</Text>}
          {childAge && <Text style={infoText}>Vârstă copil: {childAge}</Text>}
          <Text style={infoText}>Format: fizic, în București</Text>
          <Text style={infoText}>Activități: jocuri, cântece și activități creative</Text>
          {message && <Text style={infoText}>Observații: {message}</Text>}
        </Section>
        <Section style={infoBox}>
          <Text style={infoTitle}>Următorii pași:</Text>
          <Text style={infoText}>Te vom contacta pe telefon sau WhatsApp pentru confirmarea locului, grupei potrivite și detaliilor practice.</Text>
        </Section>
        <Section style={ctaSection}><Button style={button} href="https://wa.me/40763124514">Contactează-ne pe WhatsApp</Button></Section>
        <Hr style={hr} />
        <Text style={footer}>Cu drag, echipa {senderName || SITE_NAME}</Text>
        <Text style={footerSmall}>📍 București, România | 📞 +40 763 124 514</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: KidsRegistrationConfirmationEmail,
  subject: 'Confirmare cerere curs copii',
  displayName: 'Confirmare curs copii',
  previewData: { name: 'Ana Popescu', childName: 'Maya', childAge: '8 ani', message: 'Îi plac cântecele și activitățile creative.' },
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
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#25D366', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }
