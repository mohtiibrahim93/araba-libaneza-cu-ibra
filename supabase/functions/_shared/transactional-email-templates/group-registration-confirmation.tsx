import * as React from 'npm:react@19.3.0'
import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from 'npm:@react-email/components@1.0.12'
import type { TemplateEntry } from './registry.ts'
import { emailLanguage, translator } from './language.ts'

const SITE_NAME = 'Arabă Libaneză cu Ibra'
const SITE_TAGLINE = 'Centrul de Arabă Libaneză'

interface GroupRegistrationConfirmationProps {
  /** The language the visitor read the site in; Romanian when absent. */
  language?: string
  name?: string
  format?: string
  center?: string
  level?: string
  message?: string
  senderName?: string
  scheduleLabel?: string
  startDateLabel?: string
  zoomLink?: string
  icsUrl?: string
  manageUrl?: string
}

const formatLabels: Record<string, Record<string, string>> = {
  ro: { fizic: 'fizic, în București', online: 'online' },
  en: { fizic: 'in person, in Bucharest', online: 'online' },
}
const centerLabels: Record<string, Record<string, string>> = {
  ro: { bucuresti: 'Raduga Creative Center, Strada Icoanei 80, București', online: 'Online' },
  en: { bucuresti: 'Raduga Creative Center, Strada Icoanei 80, Bucharest', online: 'Online' },
}

// Keep in sync with the site (i18n programGroupDuration / curriculum.ts).
const durationByLevel: Record<string, Record<string, string>> = {
  ro: { A1: 'aproximativ 4 luni · 32 de lecții', A2: 'aproximativ 7 luni · 56 de lecții' },
  en: { A1: 'about 4 months · 32 lessons', A2: 'about 7 months · 56 lessons' },
}
const durationFallback: Record<string, string> = {
  ro: 'A1: ~4 luni (32 de lecții) · A2: ~7 luni (56 de lecții)',
  en: 'A1: ~4 months (32 lessons) · A2: ~7 months (56 lessons)',
}
const durationLabel = (lang: string, level?: string) =>
  durationByLevel[lang][(level || '').trim().toUpperCase()] || durationFallback[lang]

const defaultSchedule: Record<string, string> = {
  ro: 'marți și joi, 19:00–20:30',
  en: 'Tuesdays and Thursdays, 19:00–20:30',
}

const GroupRegistrationConfirmationEmail = ({ language, name, format, center, level, message, senderName, scheduleLabel, startDateLabel, zoomLink, icsUrl, manageUrl }: GroupRegistrationConfirmationProps) => {
  const lang = emailLanguage(language)
  const t = translator(lang)
  return (
  <Html lang={lang} dir="ltr">
    <Head />
    <Preview>{t('Am primit cererea ta pentru cursul de grup.', 'We have received your group course request.')}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logo}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />{SITE_NAME}</Text>
          <Text style={tagline}>{SITE_TAGLINE}</Text>
        </Section>
        <Heading style={h1}>{name ? t(`Mulțumim, ${name}!`, `Thank you, ${name}!`) : t('Mulțumim!', 'Thank you!')}</Heading>
        <Text style={text}>{t('Am primit cererea ta pentru cursul de grup de arabă libaneză.', 'We have received your request for the Lebanese Arabic group course.')}</Text>
        <Section style={detailsBox}>
          <Text style={infoTitle}>📚 {t('Detaliile cursului', 'Course details')}</Text>
          <Text style={infoText}><strong>{t('Tip:', 'Type:')}</strong> {t('Curs de grup', 'Group course')}</Text>
          {level && <Text style={infoText}>{t('Nivel:', 'Level:')} {level}</Text>}
          {format && <Text style={infoText}>{t('Format preferat:', 'Preferred format:')} {formatLabels[lang][format] || format}</Text>}
          {center && <Text style={infoText}>{t('Locație:', 'Location:')} {centerLabels[lang][center] || center}</Text>}
          <Text style={infoText}><strong>{t('Durată:', 'Length:')}</strong> {durationLabel(lang, level)}</Text>
          <Text style={infoText}><strong>{t('Program:', 'Schedule:')}</strong> {scheduleLabel || defaultSchedule[lang]}</Text>
          {startDateLabel && <Text style={infoText}><strong>{t('Start:', 'Starts:')}</strong> {startDateLabel}</Text>}
          {message && <Text style={infoText}>{t('Mesaj:', 'Message:')} {message}</Text>}
        </Section>

        {zoomLink && (
          <Section style={zoomBox}>
            <Text style={infoTitle}>🎥 {t('Link Zoom (lecții online)', 'Zoom link (online lessons)')}</Text>
            <Text style={infoText}>
              <Link href={zoomLink} style={link}>{zoomLink}</Link>
            </Text>
            <Text style={infoTextSmall}>{t('Salvează acest link — îl vei folosi pentru toate lecțiile online.', 'Save this link — you will use it for every online lesson.')}</Text>
          </Section>
        )}

        <Section style={infoBox}>
          <Text style={infoTitle}>✅ {t('Următorii pași', 'Next steps')}</Text>
          <Text style={checkItem}>{t('1. Te contactăm pe WhatsApp pentru confirmarea locului', '1. We contact you on WhatsApp to confirm your place')}</Text>
          <Text style={checkItem}>{t('2. Confirmăm programul și formatul (fizic/online)', '2. We confirm the schedule and the format (in person / online)')}</Text>
          <Text style={checkItem}>{t('3. Efectuezi plata (card, transfer sau cash)', '3. You pay (card, bank transfer or cash)')}</Text>
          <Text style={checkItem}>{t('4. Începem cursul împreună 🎉', '4. We start the course together 🎉')}</Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={button} href="https://wa.me/40763124514">{t('Contactează-ne pe WhatsApp', 'Message us on WhatsApp')}</Button>
          {icsUrl && (
            <Text style={textSmall}>
              📅 <Link href={icsUrl} style={link}>{t('Adaugă în calendar (.ics)', 'Add to calendar (.ics)')}</Link>
            </Text>
          )}
          {manageUrl && (
            <Text style={textSmall}>
              ⚙️ <Link href={manageUrl} style={link}>{t('Gestionează înscrierea', 'Manage your registration')}</Link>
            </Text>
          )}
        </Section>
        <Hr style={hr} />
        <Section style={footerBrand}><Text style={footerLogo}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />{senderName || SITE_NAME}</Text></Section>
        <Text style={footer}>{t('Cu drag, echipa noastră', 'Warmly, our team')}</Text>
        <Text style={footerSmall}>📍 {t('București, România', 'Bucharest, Romania')} · 📞 +40 763 124 514 · 🌐 centruldearabalibaneza.com</Text>
      </Container>
    </Body>
  </Html>
  )
}

export const template = {
  component: GroupRegistrationConfirmationEmail,
  subject: (data: Record<string, unknown>) =>
    emailLanguage(data?.language) === 'en' ? 'Group course request confirmed' : 'Confirmare cerere curs de grup',
  displayName: 'Confirmare curs de grup',
  previewData: { name: 'Maria Popescu', format: 'online', center: 'online', level: 'A1', scheduleLabel: 'marți și joi, 19:00–20:30', startDateLabel: '12 iun. 2026', zoomLink: 'https://us02web.zoom.us/j/1234567890', icsUrl: 'https://example.com/ics?id=abc', manageUrl: 'https://example.com/manage/abc' },
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
const zoomBox = { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '18px', margin: '16px 0' }
const infoBox = { backgroundColor: '#fef2f2', borderRadius: '12px', padding: '20px', margin: '24px 0' }
const infoTitle = { fontSize: '15px', fontWeight: '600' as const, color: '#1a1a2e', margin: '0 0 12px' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.5', margin: '0 0 6px' }
const infoTextSmall = { fontSize: '12px', color: '#888', lineHeight: '1.5', margin: '6px 0 0' }
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
