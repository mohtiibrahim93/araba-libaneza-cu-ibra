import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

// Configuration
const SITE_NAME = "Centrul de Araba Libaneza"
const SENDER_DOMAIN = "notify.centruldearabalibaneza.com"
const ROOT_DOMAIN = "centruldearabalibaneza.com"
const FROM_DOMAIN = "notify.centruldearabalibaneza.com"
const SITE_URL = `https://${ROOT_DOMAIN}`

// The SDK handler owns verification, dispatch, and retry semantics; this file
// owns only the email decisions: subjects, templates, and per-type props.
//
// The SDK and the templates are imported inside the handler, not at the top of
// the file. Statically imported, they put @react-email and the six templates —
// around 520 KB — into the module graph the Cloudflare worker parses before it
// can render *any* page, and a cold start spent on an auth email is the first
// byte of a page that never sends one. Nothing else changes: the imports are
// awaited before the config is built, so every render callback closes over the
// same components it always did.
export const Route = createFileRoute("/lovable/email/auth/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const [
          { createAuthEmailHandler },
          { SignupEmail },
          { InviteEmail },
          { MagicLinkEmail },
          { RecoveryEmail },
          { EmailChangeEmail },
          { ReauthenticationEmail },
        ] = await Promise.all([
          import('@lovable.dev/email-js'),
          import('@/lib/email-templates/signup'),
          import('@/lib/email-templates/invite'),
          import('@/lib/email-templates/magic-link'),
          import('@/lib/email-templates/recovery'),
          import('@/lib/email-templates/email-change'),
          import('@/lib/email-templates/reauthentication'),
        ])

        const handler = createAuthEmailHandler({
          apiKey: process.env['LOVABLE_API_KEY']!,
          from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
          senderDomain: SENDER_DOMAIN,
          sendUrl: process.env['LOVABLE_SEND_URL'],
          emails: {
            signup: {
              subject: 'Confirm your email',
              render: (data) =>
                React.createElement(SignupEmail, {
                  siteName: SITE_NAME,
                  siteUrl: SITE_URL,
                  recipient: data.email,
                  confirmationUrl: data.url,
                }),
            },
            invite: {
              subject: "You've been invited",
              render: (data) =>
                React.createElement(InviteEmail, {
                  siteName: SITE_NAME,
                  siteUrl: SITE_URL,
                  confirmationUrl: data.url,
                }),
            },
            magiclink: {
              subject: 'Your login link',
              render: (data) =>
                React.createElement(MagicLinkEmail, {
                  siteName: SITE_NAME,
                  confirmationUrl: data.url,
                }),
            },
            recovery: {
              subject: 'Reset your password',
              render: (data) =>
                React.createElement(RecoveryEmail, {
                  siteName: SITE_NAME,
                  confirmationUrl: data.url,
                }),
            },
            email_change: {
              subject: 'Confirm your new email',
              render: (data) =>
                React.createElement(EmailChangeEmail, {
                  siteName: SITE_NAME,
                  oldEmail: data.old_email ?? '',
                  email: data.email,
                  newEmail: data.new_email ?? '',
                  confirmationUrl: data.url,
                }),
            },
            reauthentication: {
              subject: 'Your verification code',
              render: (data) =>
                React.createElement(ReauthenticationEmail, { token: data.token ?? '' }),
            },
          },
        })
        return handler(request)
      },
    },
  },
})
