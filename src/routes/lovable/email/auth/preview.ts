import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

// Loaded when a preview is asked for, not when the worker starts: the six
// templates and @react-email/render are around 520 KB, and statically imported
// they sat in the module graph parsed before any page could be rendered. This
// endpoint is called by Lovable's API only.
const emailTemplates = async (): Promise<Record<string, React.ComponentType<any>>> => {
  const [signup, invite, magiclink, recovery, emailChange, reauthentication] = await Promise.all([
    import('@/lib/email-templates/signup'),
    import('@/lib/email-templates/invite'),
    import('@/lib/email-templates/magic-link'),
    import('@/lib/email-templates/recovery'),
    import('@/lib/email-templates/email-change'),
    import('@/lib/email-templates/reauthentication'),
  ])
  return {
    signup: signup.SignupEmail,
    invite: invite.InviteEmail,
    magiclink: magiclink.MagicLinkEmail,
    recovery: recovery.RecoveryEmail,
    email_change: emailChange.EmailChangeEmail,
    reauthentication: reauthentication.ReauthenticationEmail,
  }
}

// Configuration
const SITE_NAME = "Centrul de Araba Libaneza"
const ROOT_DOMAIN = "centruldearabalibaneza.com"

// Sample data for preview mode ONLY (not used in actual email sending).
// URLs are baked in at scaffold time from the project's real data.
// The sample email uses a fixed placeholder (RFC 6761 .test TLD) so the Go backend
// can always find-and-replace it with the actual recipient when sending test emails,
// even if the project's domain has changed since the template was scaffolded.
const SAMPLE_PROJECT_URL = "https://araba-libaneza-cu-ibra.lovable.app"
const SAMPLE_EMAIL = "user@example.test"
const SAMPLE_DATA: Record<string, object> = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  magiclink: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  recovery: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  invite: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  email_change: {
    siteName: SITE_NAME,
    oldEmail: SAMPLE_EMAIL,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  reauthentication: {
    token: '123456',
  },
}

export const Route = createFileRoute("/lovable/email/auth/preview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']

        if (!apiKey) {
          return Response.json(
            { error: 'Server configuration error' },
            { status: 500 }
          )
        }

        // Verify the caller is authorized with LOVABLE_API_KEY
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let type: string
        try {
          const body = await request.json()
          type = body.type
        } catch {
          return Response.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          )
        }

        const EmailTemplate = (await emailTemplates())[type]

        if (!EmailTemplate) {
          return Response.json(
            { error: `Unknown email type: ${type}` },
            { status: 400 }
          )
        }

        const sampleData = SAMPLE_DATA[type] || {}
        const { render } = await import('@react-email/render')
        const html = await render(React.createElement(EmailTemplate, sampleData))

        return new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      },
    },
  },
})
