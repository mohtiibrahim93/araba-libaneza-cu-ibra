import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Arabă Libaneză cu Ibra'

interface Props {
  name?: string
  enrollUrl?: string
  lang?: 'ro' | 'en'
}

const T = {
  ro: {
    preview: 'Mulțumim pentru lecția de probă!',
    hi: (n?: string) => n ? `Salut, ${n}!` : 'Salut!',
    intro: 'Mulțumim că ai participat la lecția de probă cu Ibra. Sperăm că ți-a plăcut și că vrei să continui călătoria în arabă libaneză.',
    cta: 'Înscrie-te la cursul complet',
    body: 'Apasă pe butonul de mai jos pentru a alege un curs de grup, lecții private sau un program pentru copii.',
    footer: 'Pe curând,',
  },
  en: {
    preview: 'Thank you for your trial lesson!',
    hi: (n?: string) => n ? `Hi, ${n}!` : 'Hi!',
    intro: 'Thanks for joining the trial lesson with Ibra. We hope you enjoyed it and want to keep going with Lebanese Arabic.',
    cta: 'Enroll in a full course',
    body: 'Tap the button below to pick a group course, private lessons, or a kids program.',
    footer: 'See you soon,',
  },
} as const

const Email = ({ name, enrollUrl = 'https://centruldearabalibaneza.com/#courses', lang = 'ro' }: Props) => {
  const t = T[lang]
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}><Text style={logo}>🌳 {SITE_NAME}</Text></Section>
          <Heading style={h1}>{t.hi(name)}</Heading>
          <Text style={text}>{t.intro}</Text>
          <Text style={text}>{t.body}</Text>
          <Section style={ctaSection}>
            <Button style={button} href={enrollUrl}>{t.cta}</Button>
          </Section>
          <Text style={textSmall}><Link href={enrollUrl} style={link}>{enrollUrl}</Link></Text>
          <Hr style={hr} />
          <Text style={footer}>{t.footer} {SITE_NAME}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Props) => d.lang === 'en' ? 'Ready to enroll in your full course?' : 'Gata să te înscrii la cursul complet?',
  displayName: 'Trial — follow-up',
  previewData: { name: 'Maria', enrollUrl: 'https://centruldearabalibaneza.com/#courses', lang: 'ro' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '20px 0 10px' }
const logo = { fontSize: '18px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const textSmall = { fontSize: '12px', color: '#888', lineHeight: '1.5', margin: '12px 0', wordBreak: 'break-all' as const }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#dc2626', color: '#ffffff', padding: '14px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' }
const link = { color: '#dc2626', textDecoration: 'underline' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footer = { fontSize: '14px', color: '#666', margin: '0 0 4px' }