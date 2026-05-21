import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Arabă Libaneză cu Ibra'

interface Props {
  name?: string
  whenLabel?: string
  inLabel?: string // "în 24 de ore" / "în 1 oră"
  format?: string
  meetLink?: string
  manageUrl?: string
  lang?: 'ro' | 'en'
}

const T = {
  ro: { preview: 'Reminder programare', hi: (n?: string) => n ? `Salut, ${n}!` : 'Salut!', body: (inLabel?: string) => `Acesta este un reminder pentru lecția ta${inLabel ? ` ${inLabel}` : ''}.`, when: 'Când', meet: 'Link Zoom', online: 'Online (Zoom)', physical: 'Fizic, în București', manage: 'Reprogramează sau anulează', manageCta: 'Gestionează programarea', footer: 'Pe curând,' },
  en: { preview: 'Booking reminder', hi: (n?: string) => n ? `Hi, ${n}!` : 'Hi!', body: (inLabel?: string) => `This is a reminder for your lesson${inLabel ? ` ${inLabel}` : ''}.`, when: 'When', meet: 'Zoom link', online: 'Online (Zoom)', physical: 'In-person, Bucharest', manage: 'Reschedule or cancel', manageCta: 'Manage booking', footer: 'See you soon,' },
} as const

const Email = ({ name, whenLabel, inLabel, format, meetLink, manageUrl, lang = 'ro' }: Props) => {
  const t = T[lang]
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}><Text style={logo}>🌳 {SITE_NAME}</Text></Section>
          <Heading style={h1}>{t.hi(name)}</Heading>
          <Text style={text}>{t.body(inLabel)}</Text>
          <Section style={detailsBox}>
            {whenLabel && <Text style={infoText}><strong>{t.when}:</strong> {whenLabel}</Text>}
            {format && <Text style={infoText}>{format === 'online' ? t.online : t.physical}</Text>}
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
  subject: (d: Props) => {
    const ro = d.lang !== 'en'
    if (d.inLabel?.includes('1') || d.inLabel?.toLowerCase().includes('hour') || d.inLabel?.toLowerCase().includes('oră')) {
      return ro ? 'Reminder: lecția ta începe în curând' : 'Reminder: your lesson starts soon'
    }
    return ro ? 'Reminder: lecția ta este mâine' : 'Reminder: your lesson is tomorrow'
  },
  displayName: 'Booking — reminder',
  previewData: { name: 'Maria', whenLabel: '12 iun. 2026, 14:00', inLabel: 'în 24 de ore', format: 'online', meetLink: 'https://us02web.zoom.us/j/1234567890', manageUrl: 'https://example.com/booking/manage/xxx', lang: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '20px 0 10px' }
const logo = { fontSize: '18px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '18px', margin: '20px 0' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 8px' }
const link = { color: '#dc2626', textDecoration: 'underline' }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#dc2626', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }