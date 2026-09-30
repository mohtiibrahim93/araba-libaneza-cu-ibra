import * as React from 'npm:react@19.3.0'
import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from 'npm:@react-email/components@1.0.12'
import type { TemplateEntry } from './registry.ts'
import { emailLanguage, translator } from './language.ts'

const SITE_NAME = 'Arabă Libaneză cu Ibra'
const SITE_TAGLINE = 'Centrul de Arabă Libaneză'

interface KidsRegistrationConfirmationProps {
  /** The language the visitor read the site in; Romanian when absent. */
  language?: string
  name?: string
  childName?: string
  childAge?: string
  message?: string
  senderName?: string
  scheduleLabel?: string
  icsUrl?: string
  manageUrl?: string
}

const KidsRegistrationConfirmationEmail = ({ language, name, childName, childAge, message, senderName, scheduleLabel, icsUrl, manageUrl }: KidsRegistrationConfirmationProps) => {
  const lang = emailLanguage(language)
  const t = translator(lang)
  return (
  <Html lang={lang} dir="ltr">
    <Head />
    <Preview>{t('Am primit cererea pentru cursul de copii.', "We have received your request for the children's course.")}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logo}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />{SITE_NAME}</Text>
          <Text style={tagline}>{SITE_TAGLINE}</Text>
        </Section>
        <Heading style={h1}>{name ? t(`Mulțumim, ${name}!`, `Thank you, ${name}!`) : t('Mulțumim!', 'Thank you!')}</Heading>
        <Text style={text}>{t('Am primit cererea pentru cursul de arabă libaneză pentru copii.', "We have received your request for the Lebanese Arabic course for children.")}</Text>
        <Section style={detailsBox}>
          <Text style={infoTitle}>📚 {t('Detaliile cursului', 'Course details')}</Text>
          <Text style={infoText}><strong>{t('Tip:', 'Type:')}</strong> {t('Curs copii', "Children's course")}</Text>
          {childName && <Text style={infoText}>{t("Nume copil:", "Child's name:")} {childName}</Text>}
          {childAge && <Text style={infoText}>{t("Vârstă copil:", "Child's age:")} {childAge}</Text>}
          <Text style={infoText}><strong>{t('Format:', 'Format:')}</strong> {t('fizic, în București', 'in person, in Bucharest')}</Text>
          {scheduleLabel && <Text style={infoText}><strong>{t('Program:', 'Schedule:')}</strong> {scheduleLabel}</Text>}
          <Text style={infoText}><strong>{t('Activități:', 'Activities:')}</strong> {t('jocuri, cântece și activități creative', 'games, songs and creative activities')}</Text>
          {message && <Text style={infoText}>{t('Observații:', 'Notes:')} {message}</Text>}
        </Section>
        <Section style={infoBox}>
          <Text style={infoTitle}>✅ {t('Următorii pași', 'Next steps')}</Text>
          <Text style={checkItem}>{t('1. Te contactăm pe WhatsApp pentru confirmare', '1. We contact you on WhatsApp to confirm')}</Text>
          <Text style={checkItem}>{t('2. Confirmăm grupa potrivită pentru copil', '2. We confirm the right group for your child')}</Text>
          <Text style={checkItem}>{t('3. Stabilim detaliile practice și plata', '3. We settle the practical details and payment')}</Text>
          <Text style={checkItem}>{t('4. Începem cursul 🎉', '4. The course begins 🎉')}</Text>
        </Section>
        <Section style={ctaSection}>
          <Button style={button} href="https://wa.me/40763124514">{t('Contactează-ne pe WhatsApp', 'Message us on WhatsApp')}</Button>
          {icsUrl && (
            <Text style={textSmall}>📅 <Link href={icsUrl} style={link}>{t('Adaugă în calendar (.ics)', 'Add to calendar (.ics)')}</Link></Text>
          )}
          {manageUrl && (
            <Text style={textSmall}>⚙️ <Link href={manageUrl} style={link}>{t('Gestionează înscrierea', 'Manage your registration')}</Link></Text>
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
  component: KidsRegistrationConfirmationEmail,
  subject: (data: Record<string, unknown>) =>
    emailLanguage(data?.language) === 'en' ? "Children's course request confirmed" : 'Confirmare cerere curs copii',
  displayName: 'Confirmare curs copii',
  previewData: { name: 'Ana Popescu', childName: 'Maya', childAge: '8 ani', message: 'Îi plac cântecele și activitățile creative.', scheduleLabel: 'sâmbătă, 11:00–12:00', icsUrl: 'https://example.com/ics?id=abc' },
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
const infoBox = { backgroundColor: '#fef2f2', borderRadius: '12px', padding: '20px', margin: '24px 0' }
const infoTitle = { fontSize: '15px', fontWeight: '600' as const, color: '#1a1a2e', margin: '0 0 12px' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.5', margin: '0 0 6px' }
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
