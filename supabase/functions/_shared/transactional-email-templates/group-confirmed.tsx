import * as React from 'npm:react@19.3.0'
import { Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@1.0.12'
import type { TemplateEntry } from './registry.ts'
import { emailLanguage, translator } from './language.ts'

/**
 * "Your group starts for sure" — sent once to each student of a group when the
 * owner sets it to "Minim atins" (minimum reached) in the admin.
 *
 * The owner's rule: the announced start date stays fixed, and a group is
 * confirmed as soon as half its places are taken. Saying so straight away is
 * the point — a student who knows the group will run stops wondering, and a
 * confirmed group is also easier to recommend to a friend.
 */
const SITE_NAME = 'Arabă Libaneză cu Ibra'
const SITE_TAGLINE = 'Centrul de Arabă Libaneză'

interface GroupConfirmedProps {
  language?: string
  name?: string
  level?: string
  format?: string
  startDateLabel?: string
  scheduleLabel?: string
}

const GroupConfirmedEmail = ({ language, name, level, format, startDateLabel, scheduleLabel }: GroupConfirmedProps) => {
  const lang = emailLanguage(language)
  const t = translator(lang)
  const fmt = format === 'fizic' ? t('fizic, în București', 'in person, in Bucharest') : 'online'
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>
        {t(`Grupa ta pornește sigur${startDateLabel ? ` pe ${startDateLabel}` : ''}.`, `Your group starts for sure${startDateLabel ? ` on ${startDateLabel}` : ''}.`)}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}><Img src="https://centruldearabalibaneza.com/logo-mark.png" width="24" height="24" alt="" style={logoMark} />{SITE_NAME}</Text>
            <Text style={tagline}>{SITE_TAGLINE}</Text>
          </Section>
          <Heading style={h1}>
            {t('Grupa ta pornește sigur', 'Your group starts for sure')}{startDateLabel ? t(` pe ${startDateLabel}`, ` on ${startDateLabel}`) : ''} 🎉
          </Heading>
          <Text style={text}>
            {name ? t(`Salut, ${name}!`, `Hi ${name}!`) : t('Salut!', 'Hi!')}{' '}
            {t(
              'Grupa ta a atins numărul minim de cursanți, așa că pornește la data anunțată.',
              'Your group has reached its minimum number of students, so it starts on the announced date.',
            )}
          </Text>
          <Section style={detailsBox}>
            {level && <Text style={infoText}><strong>{t('Nivel:', 'Level:')}</strong> {level}</Text>}
            {format && <Text style={infoText}><strong>{t('Format:', 'Format:')}</strong> {fmt}</Text>}
            {startDateLabel && <Text style={infoText}><strong>{t('Start:', 'Starts:')}</strong> {startDateLabel}</Text>}
            {scheduleLabel && <Text style={infoText}><strong>{t('Program:', 'Schedule:')}</strong> {scheduleLabel}</Text>}
          </Section>
          <Text style={text}>
            {t(
              'Nu trebuie să faci nimic acum. Înainte de prima lecție primești toate detaliile. Dacă ai o întrebare, răspunde la acest email sau scrie-ne pe WhatsApp: +40 763 124 514.',
              'There is nothing you need to do now. You will get all the details before the first lesson. If you have a question, reply to this email or message us on WhatsApp: +40 763 124 514.',
            )}
          </Text>
          <Hr style={hr} />
          <Text style={footer}>{t('Ne vedem la curs! — Ibra', 'See you in class! — Ibra')}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: GroupConfirmedEmail,
  subject: (data: Record<string, any>) =>
    emailLanguage(data?.language) === 'en'
      ? `Your group starts for sure${data?.startDateLabel ? ` on ${data.startDateLabel}` : ''}`
      : `Grupa ta pornește sigur${data?.startDateLabel ? ` pe ${data.startDateLabel}` : ''}`,
  displayName: 'Grupa confirmată (minim atins)',
  previewData: {
    language: 'ro',
    name: 'Maria',
    level: 'A1',
    format: 'online',
    startDateLabel: 'sâmbătă, 7 noiembrie 2026',
    scheduleLabel: 'Sâmbătă 14:00–15:30 & Duminică 15:00–16:30',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, padding: '24px 0 16px', borderBottom: '3px solid #dc2626', marginBottom: '8px' }
const logo = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0' }
const logoMark = { display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }
const tagline = { fontSize: '12px', color: '#888', margin: '4px 0 0', letterSpacing: '0.5px', textTransform: 'uppercase' as const }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '20px 0' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.5', margin: '0 0 6px' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footer = { fontSize: '14px', color: '#4a4a5a', margin: '0' }
