// Managed email transport for edge-function features.
//
// Each feature keeps its own send trigger; this module only renders the
// registered template and hands the email to Lovable's managed email API,
// which owns delivery, retries, rate limits, suppression and unsubscribe.
// There is no queue, no cron dispatcher and no suppression table to consult.
import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { EmailAPIError, sendLovableEmail } from 'npm:@lovable.dev/email-js'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { TEMPLATES } from './transactional-email-templates/registry.ts'

const SITE_NAME = 'araba-libaneza-cu-ibra'
// Verified delegated sender subdomain — never the root domain.
const SENDER_DOMAIN = 'notify.centruldearabalibaneza.com'
const FROM_DOMAIN = 'centruldearabalibaneza.com'
const DEFAULT_FROM = `${SITE_NAME} <noreply@${FROM_DOMAIN}>`

// Templates whose visible sender is admin-configurable.
const SENDER_OVERRIDE_TEMPLATES = new Set([
  'registration-confirmation',
  'group-registration-confirmation',
  'private-registration-confirmation',
  'kids-registration-confirmation',
])

export type SendTemplateEmailResult =
  | { sent: true }
  | { sent: false; reason: 'recipient_suppressed' }

export interface SendTemplateEmailOptions {
  templateData?: Record<string, unknown>
  /** Dedupes retries of the same logical send. */
  idempotencyKey?: string
}

// deno-lint-ignore no-explicit-any
function serviceClient(): any {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
}

async function logSend(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  row: {
    message_id: string | null
    template_name: string
    recipient_email: string
    status: 'sent' | 'suppressed' | 'failed'
    error_message?: string
  },
): Promise<void> {
  const { error } = await supabase.from('email_send_log').insert(row)
  if (error) {
    console.error('[managed-email] email_send_log insert failed', {
      status: row.status,
      code: error.code,
      message: error.message,
    })
  }
}

/**
 * Renders a registered template and sends it through Lovable's managed email
 * API. A suppressed recipient is a normal outcome ({ sent: false }); any other
 * failure throws (EmailAPIError exposes .code and .status).
 */
export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY is not configured')
  }

  const template = TEMPLATES[templateName]
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`,
    )
  }

  // Template-level `to` wins: notification templates always go to their
  // fixed address (e.g. the school inbox).
  const recipient = template.to || to
  if (!recipient) {
    throw new Error('Recipient is required (the template defines no fixed recipient)')
  }

  const supabase = serviceClient()
  const messageId = crypto.randomUUID()
  let templateData: Record<string, unknown> = options.templateData ?? {}
  let fromAddress = DEFAULT_FROM

  if (SENDER_OVERRIDE_TEMPLATES.has(templateName)) {
    const { data: settings, error: settingsError } = await supabase
      .from('email_confirmation_settings')
      .select('sender_name, sender_email')
      .eq('id', 1)
      .maybeSingle()

    if (settingsError) {
      console.warn('[managed-email] could not load sender settings', {
        code: settingsError.code,
        message: settingsError.message,
      })
    } else if (settings?.sender_name && settings?.sender_email) {
      fromAddress = `${settings.sender_name} <${settings.sender_email}>`
      templateData = { senderName: settings.sender_name, ...templateData }
    }
  }

  const element = React.createElement(template.component, templateData)
  const html = await renderAsync(element)
  const text = await renderAsync(element, { plainText: true })
  const subject = typeof template.subject === 'function'
    ? template.subject(templateData)
    : template.subject

  const request = {
    to: recipient,
    from: fromAddress,
    sender_domain: SENDER_DOMAIN,
    subject,
    html,
    text,
    purpose: 'transactional' as const,
    label: templateName,
    idempotency_key: options.idempotencyKey || messageId,
    message_id: messageId,
  }
  const sendOptions = { apiKey, sendUrl: Deno.env.get('LOVABLE_SEND_URL') }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await sendLovableEmail(request, sendOptions)
      await logSend(supabase, {
        message_id: messageId,
        template_name: templateName,
        recipient_email: recipient,
        status: 'sent',
      })
      return { sent: true }
    } catch (error) {
      // Rate limited: wait the advertised cooldown once, then retry.
      if (
        attempt === 0 && error instanceof EmailAPIError && error.status === 429
      ) {
        const waitSeconds = error.retryAfterSeconds ?? 60
        console.warn('[managed-email] rate limited, waiting', { waitSeconds })
        await new Promise((r) => setTimeout(r, waitSeconds * 1000))
        continue
      }

      if (error instanceof EmailAPIError && error.code === 'recipient_suppressed') {
        await logSend(supabase, {
          message_id: messageId,
          template_name: templateName,
          recipient_email: recipient,
          status: 'suppressed',
        })
        return { sent: false, reason: 'recipient_suppressed' }
      }

      const message = error instanceof Error ? error.message : String(error)
      await logSend(supabase, {
        message_id: messageId,
        template_name: templateName,
        recipient_email: recipient,
        status: 'failed',
        error_message: message.slice(0, 1000),
      })
      throw error
    }
  }

  // Unreachable: the loop either returns or throws.
  throw new Error('Email send failed')
}
