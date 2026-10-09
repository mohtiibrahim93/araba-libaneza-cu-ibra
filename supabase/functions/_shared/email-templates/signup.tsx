/// <reference types="npm:@types/react@19.3.0" />

import * as React from 'npm:react@19.3.0'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@1.0.12'

/**
 * The code first here too, and this is the one that matters.
 *
 * A visitor booking a free trial has never signed in, so Supabase treats the
 * confirmation as a *signup* and sends this email, not the magic-link one —
 * which is a thing worth writing down, because the obvious place to put a
 * one-time code is the magic-link template and that would have covered
 * everyone except the first-time visitor the whole change is for.
 *
 * The button stays below the code: a real signup elsewhere still confirms by
 * following a link, and a link opened in another tab would leave a selected
 * slot behind in this one.
 */
interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  /** The six-digit code. Absent only if Supabase sent no token. */
  token?: string | undefined
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  token,
}: SignupEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>
      {token ? `Codul tău pentru ${siteName}: ${token}` : `Confirmă-ți emailul pentru ${siteName}`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{token ? 'Codul tău de confirmare' : 'Confirmă-ți emailul'}</Heading>
        {token ? (
          <>
            <Text style={text}>
              Scrie codul de mai jos în pagina pe care ai lăsat-o deschisă, ca
              să confirmăm adresa{' '}
              <Link href={`mailto:${recipient}`} style={link}>
                {recipient}
              </Link>
              . Intervalul pe care l-ai ales te așteaptă acolo.
            </Text>
            <Text style={codeStyle}>{token}</Text>
            <Text style={text}>
              Sau apasă butonul — se deschide o pagină nouă și confirmă direct.
            </Text>
          </>
        ) : (
          <>
            <Text style={text}>
              Mulțumim că te-ai înscris la{' '}
              <Link href={siteUrl} style={link}>
                <strong>{siteName}</strong>
              </Link>
              !
            </Text>
            <Text style={text}>
              Te rugăm să confirmi adresa de email (
              <Link href={`mailto:${recipient}`} style={link}>
                {recipient}
              </Link>
              ) apăsând butonul de mai jos:
            </Text>
          </>
        )}
        <Button style={button} href={confirmationUrl}>
          Confirmă emailul
        </Button>
        <Text style={footer}>
          {token
            ? 'Codul și linkul expiră în scurt timp. Dacă nu ai cerut nimic, poți ignora acest email.'
            : 'Dacă nu ți-ai creat un cont, poți ignora acest email.'}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
}
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 700 as const,
  color: 'hsl(220, 14%, 10%)',
  margin: '0 0 20px',
  letterSpacing: '-0.01em',
}
const text = {
  fontSize: '15px',
  color: 'hsl(220, 9%, 35%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const link = { color: 'hsl(0, 72%, 51%)', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(0, 72%, 51%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '8px 0 24px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 700 as const,
  color: 'hsl(0, 72%, 51%)',
  letterSpacing: '0.15em',
  margin: '0 0 24px',
}
const footer = { fontSize: '13px', color: 'hsl(220, 9%, 55%)', margin: '32px 0 0', lineHeight: '1.5' }
