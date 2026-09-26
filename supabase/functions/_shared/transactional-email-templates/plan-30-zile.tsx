import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Arabă Libaneză cu Ibra'
const BASE = 'https://centruldearabalibaneza.com'

interface Props {
  name?: string
  downloadUrl?: string
  trialUrl?: string
}

const Email = ({
  name,
  downloadUrl = `${BASE}/plan-30-zile-araba-libaneza.pdf`,
  trialUrl = `${BASE}/trial`,
}: Props) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Planul tău de 30 de zile pentru araba libaneză</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={logo}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />{SITE_NAME}</Text></Section>
        <Heading style={h1}>{name ? `Salut, ${name}!` : 'Salut!'}</Heading>
        <Text style={text}>
          Mai jos ai planul de 30 de zile: 15–20 de minute pe zi, cu ce asculți, ce repeți și ce
          notezi în fiecare zi, plus puncte de verificare la final de săptămână. Totul cu resurse
          gratuite și scris în arabizi, fără alfabet arab.
        </Text>
        <Section style={ctaSection}>
          <Button style={button} href={downloadUrl}>Descarcă planul de 30 de zile (PDF)</Button>
        </Section>
        <Text style={textSmall}><Link href={downloadUrl} style={link}>{downloadUrl}</Link></Text>
        <Hr style={hr} />
        <Text style={text}>
          Ziua 1 începe azi: alege o oră fixă și ține-o. La finalul lunii, o lecție de probă gratuită
          cu profesor nativ îți arată exact unde ești și ce ai de corectat la pronunție.
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
  subject: 'Planul tău de 30 de zile pentru araba libaneză (PDF)',
  displayName: 'Resursă — plan 30 de zile',
  previewData: {
    name: 'Maria',
    downloadUrl: `${BASE}/plan-30-zile-araba-libaneza.pdf`,
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
const logoMark = { display: 'inline-block', verticalAlign: 'middle', borderRadius: '5px', marginRight: '8px' }
