import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

type Action = 'new' | 'cancelled' | 'rescheduled'

interface AdminBookingProps {
  action?: Action
  eventName?: string
  studentName?: string
  studentEmail?: string
  studentPhone?: string
  format?: string
  whenLabel?: string
  oldWhenLabel?: string
  newWhenLabel?: string
  notes?: string
  calendarSyncError?: string | null
}

const HEADINGS: Record<Action, string> = {
  new: '📅 Rezervare nouă',
  cancelled: '❌ Rezervare anulată',
  rescheduled: '🔄 Rezervare reprogramată',
}

const SUBJECT_PREFIX: Record<Action, string> = {
  new: 'Rezervare nouă',
  cancelled: 'Rezervare anulată',
  rescheduled: 'Rezervare reprogramată',
}

const AdminBookingEmail = ({
  action = 'new',
  eventName,
  studentName,
  studentEmail,
  studentPhone,
  format,
  whenLabel,
  oldWhenLabel,
  newWhenLabel,
  notes,
  calendarSyncError,
}: AdminBookingProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>{`${SUBJECT_PREFIX[action] ?? SUBJECT_PREFIX.new}: ${studentName || 'cursant'}${eventName ? ` (${eventName})` : ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{HEADINGS[action] ?? HEADINGS.new}</Heading>
        <Text style={text}>Notificare din calendarul de rezervări.</Text>
        <Section style={detailsBox}>
          {eventName && <Text style={infoText}><strong>Tip întâlnire:</strong> {eventName}</Text>}
          {studentName && <Text style={infoText}><strong>Nume:</strong> {studentName}</Text>}
          {studentPhone && <Text style={infoText}><strong>Telefon:</strong> {studentPhone}</Text>}
          {studentEmail && <Text style={infoText}><strong>Email:</strong> {studentEmail}</Text>}
          {format && <Text style={infoText}><strong>Format:</strong> {format}</Text>}
          {action === 'rescheduled' ? (
            <>
              {oldWhenLabel && <Text style={infoText}><strong>Data veche:</strong> {oldWhenLabel}</Text>}
              {newWhenLabel && <Text style={infoText}><strong>Data nouă:</strong> {newWhenLabel}</Text>}
            </>
          ) : (
            whenLabel && <Text style={infoText}><strong>Data:</strong> {whenLabel}</Text>
          )}
          {notes && <Text style={infoText}><strong>Detalii:</strong> {notes}</Text>}
        </Section>
        {calendarSyncError && (
          <Section style={warnBox}>
            <Text style={warnText}>
              <strong>⚠️ Nu am putut adăuga lecția în Google Calendar.</strong>
            </Text>
            <Text style={warnText}>
              Rezervarea este salvată și cursantul a primit confirmarea, dar evenimentul
              lipsește din calendarul tău — adaugă-l manual. Motiv tehnic: {calendarSyncError}.
            </Text>
          </Section>
        )}
        <Hr style={hr} />
        <Text style={footerSmall}>Notificare automată — centruldearabalibaneza.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminBookingEmail,
  subject: (data: Record<string, any>) => {
    const action: Action = (data?.['action'] as Action) || 'new'
    const prefix = SUBJECT_PREFIX[action] ?? SUBJECT_PREFIX['new']
    return `${prefix}: ${data?.['studentName'] || 'cursant'}${data?.['eventName'] ? ` (${data['eventName']})` : ''}`
  },
  displayName: 'Notificare admin — rezervare',
  previewData: {
    action: 'new',
    eventName: 'Probă gratuită',
    studentName: 'Maria Popescu',
    studentEmail: 'maria@example.com',
    studentPhone: '+40 712 345 678',
    format: 'online',
    whenLabel: '3 sep. 2026, 18:00',
    notes: 'Nivel: A1',
    calendarSyncError: null,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a2e', margin: '20px 0 12px' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '18px', margin: '16px 0' }
const infoText = { fontSize: '14px', color: '#1a1a2e', lineHeight: '1.6', margin: '0 0 6px' }
const warnBox = { backgroundColor: '#fff7ed', border: '1px solid #fdba74', borderRadius: '12px', padding: '16px', margin: '16px 0' }
const warnText = { fontSize: '14px', color: '#7c2d12', lineHeight: '1.6', margin: '0 0 6px' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0 12px' }
const footerSmall = { fontSize: '12px', color: '#999', margin: '0' }
