import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'

// Terminal delivery outcomes reported by Lovable's managed email delivery.
// These records are a convenience view for the admin dashboard only — Lovable
// enforces suppression server-side at send time, so nothing here gates sends.

type Reason = 'bounce' | 'complaint' | 'unsubscribe'

const LOG_STATUS: Record<Reason, 'bounced' | 'complained' | 'suppressed'> = {
  bounce: 'bounced',
  complaint: 'complained',
  unsubscribe: 'suppressed',
}

const LOG_MESSAGE: Record<Reason, string> = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
}

async function recordOutcome(
  reason: Reason,
  recipient: string,
  messageId: string | null,
  eventId: string,
) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
  const email = recipient.toLowerCase()

  // Idempotent on the recipient — safe for webhook redeliveries.
  const { error: suppressError } = await supabaseAdmin
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })

  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      event_id: eventId,
      code: suppressError.code,
      message: suppressError.message,
    })
    throw new Error('Failed to write suppression')
  }

  const { error: insertError } = await supabaseAdmin
    .from('email_send_log')
    .insert({
      message_id: messageId,
      template_name: 'system',
      recipient_email: email,
      status: LOG_STATUS[reason],
      error_message: LOG_MESSAGE[reason],
      metadata: null,
    })

  if (insertError) {
    // Non-fatal: the suppression record was already written.
    console.warn('Failed to insert email_send_log', {
      event_id: eventId,
      code: insertError.code,
      message: insertError.message,
    })
  }
}

export const Route = createFileRoute('/lovable/email/events')({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': async (event) => {
              await recordOutcome(
                'bounce',
                event.data.recipient,
                event.data.message_id ?? null,
                event.event_id,
              )
            },
            'email.complaint': async (event) => {
              await recordOutcome(
                'complaint',
                event.data.recipient,
                event.data.message_id ?? null,
                event.event_id,
              )
            },
            'email.unsubscribed': async (event) => {
              await recordOutcome(
                'unsubscribe',
                event.data.recipient,
                event.data.message_id ?? null,
                event.event_id,
              )
            },
          },
        })
        return handler(request)
      },
    },
  },
})
