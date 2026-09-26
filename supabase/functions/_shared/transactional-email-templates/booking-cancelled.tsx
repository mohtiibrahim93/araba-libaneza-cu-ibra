import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Arabă Libaneză cu Ibra'

interface Props {
  name?: string
  whenLabel?: string
  lang?: 'ro' | 'en'
}

const T = {
  ro: { preview: 'Programarea ta a fost anulată.', hi: (n?: string) => n ? `Salut, ${n}!` : 'Salut!', body: 'Confirmăm că programarea ta a fost anulată.', when: 'Programarea anulată', rebook: 'Poți face oricând o nouă programare de pe site-ul nostru.', footer: 'Mulțumim,' },
  en: { preview: 'Your booking was cancelled.', hi: (n?: string) => n ? `Hi, ${n}!` : 'Hi!', body: 'We confirm your booking has been cancelled.', when: 'Cancelled slot', rebook: 'You can book again anytime from our website.', footer: 'Thanks,' },
} as const

const Email = ({ name, whenLabel, lang = 'ro' }: Props) => {
  const t = T[lang]
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}><Text style={logo}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />{SITE_NAME}</Text></Section>
          <Heading style={h1}>{t.hi(name)}</Heading>
          <Text style={text}>{t.body}</Text>
          {whenLabel && (
            <Section style={detailsBox}>
              <Text style={infoText}><strong>{t.when}:</strong> {whenLabel}</Text>
            </Section>
          )}
          <Text style={text}>{t.rebook}</Text>
          <Hr style={hr} />
          <Text style={footer}>{t.footer} {SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Props) => d.lang === 'en' ? 'Booking cancelled' : 'Programare anulată',
  displayName: 'Booking — anulare',
  previewData: { name: 'Maria', whenLabel: '12 iun. 2026, 14:00', lang: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '20px 0 10px' }
const logo = { fontSize: '18px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '20px 0' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.6', margin: '0' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }
const logoMark = { display: 'inline-block', verticalAlign: 'middle', borderRadius: '5px', marginRight: '8px' }
