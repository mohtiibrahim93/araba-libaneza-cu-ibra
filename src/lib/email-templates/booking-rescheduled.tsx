import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'Arabă Libaneză cu Ibra'

interface Props {
  name?: string
  oldWhenLabel?: string
  newWhenLabel?: string
  meetLink?: string
  manageUrl?: string
  lang?: 'ro' | 'en'
}

const T = {
  ro: { preview: 'Programarea ta a fost reprogramată.', hi: (n?: string) => n ? `Salut, ${n}!` : 'Salut!', body: 'Programarea ta a fost actualizată cu succes.', oldWhen: 'Înainte', newWhen: 'Acum', meet: 'Link-ul Zoom pentru lecție', manageCta: 'Gestionează programarea', footer: 'Pe curând,' },
  en: { preview: 'Your booking was rescheduled.', hi: (n?: string) => n ? `Hi, ${n}!` : 'Hi!', body: 'Your booking has been successfully rescheduled.', oldWhen: 'Was', newWhen: 'Now', meet: 'Zoom link for your lesson', manageCta: 'Manage booking', footer: 'See you soon,' },
} as const

const Email = ({ name, oldWhenLabel, newWhenLabel, meetLink, manageUrl, lang = 'ro' }: Props) => {
  const t = T[lang]
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}><Text style={logo}>🌳 {SITE_NAME}</Text></Section>
          <Heading style={h1}>{t.hi(name)}</Heading>
          <Text style={text}>{t.body}</Text>
          <Section style={detailsBox}>
            {oldWhenLabel && <Text style={infoTextOld}><strong>{t.oldWhen}:</strong> {oldWhenLabel}</Text>}
            {newWhenLabel && <Text style={infoText}><strong>{t.newWhen}:</strong> {newWhenLabel}</Text>}
            {meetLink && <Text style={infoText}><strong>{t.meet}:</strong> <Link href={meetLink} style={link}>{meetLink}</Link></Text>}
          </Section>
          {manageUrl && (
            <Section style={ctaSection}>
              <Button style={button} href={manageUrl}>{t.manageCta}</Button>
            </Section>
          )}
          <Hr style={hr} />
          <Text style={footer}>{t.footer} {SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Props) => d.lang === 'en' ? 'Booking rescheduled' : 'Programare reprogramată',
  displayName: 'Booking — reprogramare',
  previewData: { name: 'Maria', oldWhenLabel: '12 iun. 2026, 14:00', newWhenLabel: '14 iun. 2026, 16:00', meetLink: 'https://us02web.zoom.us/j/1234567890', manageUrl: 'https://example.com/booking/manage/xxx', lang: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '20px 0 10px' }
const logo = { fontSize: '18px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '18px', margin: '20px 0' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 8px' }
const infoTextOld = { fontSize: '14px', color: '#888', lineHeight: '1.6', margin: '0 0 8px', textDecoration: 'line-through' as const }
const link = { color: '#dc2626', textDecoration: 'underline' }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#dc2626', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }