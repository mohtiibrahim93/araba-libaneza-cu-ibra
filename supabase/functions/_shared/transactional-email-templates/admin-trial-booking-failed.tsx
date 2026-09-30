import * as React from 'npm:react@19.3.0'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from 'npm:@react-email/components@1.0.12'
import type { TemplateEntry } from './registry.ts'

/**
 * The one failure in the trial flow that strands a person.
 *
 * A free trial is booked only after the card is saved: the slot travels to
 * Stripe in the session metadata and stripe-webhook calls booking-create when
 * the card comes back. If that call fails — the slot was taken during the
 * thirty seconds on Stripe's page, or the email had already used its trial —
 * the visitor is left with a card on file, no booking, and a toast telling them
 * their spot is confirmed.
 *
 * Nothing else notices. The webhook deliberately logs rather than throws, so
 * Stripe does not retry the whole event and re-run the card update above it,
 * which means the only trace is a log line nobody is watching.
 *
 * So this email exists to make that case reach a human while it is still
 * fixable — every detail needed to create the booking by hand or call the
 * person back is in it, because the booking that would have held them does not
 * exist to look up.
 *
 * Private lessons reuse it (kind: "private"): they are booked the same way,
 * by the webhook once the payment clears, and fail the same way — paid, told
 * it is confirmed, and one or more lessons missing from the calendar.
 */
interface AdminTrialBookingFailedProps {
  kind?: 'trial' | 'private'
  name?: string
  email?: string
  phone?: string
  startAt?: string
  format?: string
  registrationId?: string
  reason?: string
}

const AdminTrialBookingFailedEmail = ({ kind, name, email, phone, startAt, format, registrationId, reason }: AdminTrialBookingFailedProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>{kind === 'private' ? 'Lecții private plătite, dar neprogramate' : 'Proba nu s-a programat'}: {name || 'cursant'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{kind === 'private' ? '⚠️ Lecții private neprogramate' : '⚠️ Proba nu s-a programat'}</Heading>
        <Text style={text}>
          {kind === 'private'
            ? 'Plata a trecut, dar una sau mai multe lecții nu s-au creat în calendar. Cursantul crede că are lecțiile confirmate. Contactează-l sau creează programările manual.'
            : 'Cardul a fost salvat, dar programarea nu s-a creat. Cursantul crede că are locul confirmat. Sună-l sau creează programarea manual.'}
        </Text>
        <Section style={detailsBox}>
          {name && <Text style={infoText}><strong>Nume:</strong> {name}</Text>}
          {phone && <Text style={infoText}><strong>Telefon:</strong> {phone}</Text>}
          {email && <Text style={infoText}><strong>Email:</strong> {email}</Text>}
          {startAt && <Text style={infoText}><strong>Intervalul cerut:</strong> {startAt}</Text>}
          {format && <Text style={infoText}><strong>Format:</strong> {format}</Text>}
          {registrationId && <Text style={infoText}><strong>ID înscriere:</strong> {registrationId}</Text>}
        </Section>
        {reason && (
          <Section style={reasonBox}>
            <Text style={infoText}><strong>Motiv:</strong> {reason}</Text>
          </Section>
        )}
        <Text style={text}>
          {kind === 'private'
            ? 'Cel mai probabil intervalul (sau una dintre săptămânile seriei) a fost ocupat între timp.'
            : 'Cel mai probabil intervalul a fost ocupat cât timp cursantul era pe pagina Stripe, sau adresa de email își folosise deja proba gratuită.'}
        </Text>
        <Hr style={hr} />
        <Text style={footerSmall}>Notificare automată — centruldearabalibaneza.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminTrialBookingFailedEmail,
  subject: (data: Record<string, any>) =>
    data?.kind === 'private'
      ? `Lecții private plătite, dar neprogramate: ${data?.name || 'cursant'}`
      : `Proba nu s-a programat: ${data?.name || 'cursant'} — cardul este salvat`,
  displayName: 'Notificare admin — proba nu s-a programat',
  previewData: {
    name: 'Maria Popescu',
    phone: '+40 712 345 678',
    email: 'maria@example.com',
    startAt: '2026-10-08 12:30 (Europa/București)',
    format: 'online',
    registrationId: '00000000-0000-0000-0000-000000000000',
    reason: 'booking-create a răspuns 409: conflict',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 16px' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '16px 0' }
const reasonBox = { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '18px', margin: '16px 0' }
const infoText = { fontSize: '14px', color: '#4a4a5a', lineHeight: '1.5', margin: '0 0 6px' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 20px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }
