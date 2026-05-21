import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Arabă Libaneză cu Ibra'

interface Props {
  name?: string
  whenLabel?: string
  durationMin?: number
  format?: string
  meetLink?: string
  manageUrl?: string
  lang?: 'ro' | 'en'
}

const T = {
  ro: {
    preview: 'Programarea ta este confirmată.',
    hi: (n?: string) => n ? `Salut, ${n}!` : 'Salut!',
    confirmed: 'Programarea ta este confirmată. Detaliile mai jos:',
    when: 'Când',
    duration: 'Durată',
    format: 'Format',
    online: 'Online (Zoom)',
    physical: 'Fizic, în București',
    meet: 'Link Zoom',
    manage: 'Reprogramează sau anulează',
    manageCta: 'Gestionează programarea',
    footer: 'Pe curând,',
    min: 'minute',
    addedCal: 'Ai primit deja invitația în Google Calendar.',
  },
  en: {
    preview: 'Your booking is confirmed.',
    hi: (n?: string) => n ? `Hi, ${n}!` : 'Hi!',
    confirmed: 'Your booking is confirmed. Details below:',
    when: 'When',
    duration: 'Duration',
    format: 'Format',
    online: 'Online (Zoom)',
    physical: 'In-person, Bucharest',
    meet: 'Zoom link',
    manage: 'Reschedule or cancel',
    manageCta: 'Manage booking',
    footer: 'See you soon,',
    min: 'minutes',
    addedCal: 'A Google Calendar invite has been sent.',
  },
} as const

const Email = ({ name, whenLabel, durationMin, format, meetLink, manageUrl, lang = 'ro' }: Props) => {
  const t = T[lang]
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}><Text style={logo}>🌳 {SITE_NAME}</Text></Section>
          <Heading style={h1}>{t.hi(name)}</Heading>
          <Text style={text}>{t.confirmed}</Text>
          <Section style={detailsBox}>
            {whenLabel && <Text style={infoText}><strong>{t.when}:</strong> {whenLabel}</Text>}
            {durationMin && <Text style={infoText}><strong>{t.duration}:</strong> {durationMin} {t.min}</Text>}
            {format && <Text style={infoText}><strong>{t.format}:</strong> {format === 'online' ? t.online : t.physical}</Text>}
            {meetLink && <Text style={infoText}><strong>{t.meet}:</strong> <Link href={meetLink} style={link}>{meetLink}</Link></Text>}
          </Section>
          <Text style={text}>{t.addedCal}</Text>
          {manageUrl && (
            <Section style={ctaSection}>
              <Button style={button} href={manageUrl}>{t.manageCta}</Button>
            </Section>
          )}
          {manageUrl && <Text style={textSmall}>{t.manage}: <Link href={manageUrl} style={link}>{manageUrl}</Link></Text>}
          <Hr style={hr} />
          <Text style={footer}>{t.footer} {SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Props) => d.lang === 'en' ? 'Booking confirmed' : 'Programare confirmată',
  displayName: 'Booking — confirmare',
  previewData: { name: 'Maria', whenLabel: '12 iun. 2026, 14:00', durationMin: 60, format: 'online', meetLink: 'https://us02web.zoom.us/j/1234567890', manageUrl: 'https://example.com/booking/manage/xxx', lang: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '20px 0 10px' }
const logo = { fontSize: '18px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const textSmall = { fontSize: '12px', color: '#888', lineHeight: '1.5', margin: '12px 0', wordBreak: 'break-all' as const }
const detailsBox = { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '18px', margin: '20px 0' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 8px' }
const link = { color: '#dc2626', textDecoration: 'underline' }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#dc2626', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }