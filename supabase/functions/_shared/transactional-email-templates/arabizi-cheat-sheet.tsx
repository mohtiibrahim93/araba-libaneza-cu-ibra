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
  downloadUrl = `${BASE}/arabizi-cheat-sheet.pdf`,
  trialUrl = `${BASE}/trial`,
}: Props) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Cheat-sheet-ul Arabizi este aici — cifrele 2, 3, 5, 7 explicate</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}><Text style={logo}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />{SITE_NAME}</Text></Section>
        <Heading style={h1}>{name ? `Salut, ${name}!` : 'Salut!'}</Heading>
        <Text style={text}>
          Mai jos ai cheat-sheet-ul Arabizi: tabelul complet cu cifrele care înlocuiesc literele
          arabe (2, 3, 5, 6, 7, 8, 9), 20 de expresii libaneze esențiale și un exemplu de mesaj real
          decodat cuvânt cu cuvânt.
        </Text>
        <Section style={ctaSection}>
          <Button style={button} href={downloadUrl}>Descarcă cheat-sheet-ul (PDF)</Button>
        </Section>
        <Text style={textSmall}><Link href={downloadUrl} style={link}>{downloadUrl}</Link></Text>
        <Hr style={hr} />
        <Text style={text}>
          Următorul pas natural: 30 de minute de conversație cu un profesor nativ, gratuit și fără
          nicio obligație — online sau fizic în București.
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
  subject: 'Cheat-sheet-ul Arabizi (PDF) — cifrele 2, 3, 5, 7 explicate',
  displayName: 'Arabizi — cheat-sheet',
  previewData: {
    name: 'Maria',
    downloadUrl: `${BASE}/arabizi-cheat-sheet.pdf`,
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
