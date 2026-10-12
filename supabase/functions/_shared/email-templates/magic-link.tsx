/// <reference types="npm:@types/react@19.3.0" />

import * as React from 'npm:react@19.3.0'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@1.0.12'

/**
 * The code first, the link second.
 *
 * Supabase sends one email for an email sign-in and puts both in the payload:
 * a one-time token and a URL. This template used to render only the URL, and
 * that is a problem for the one flow that needs it most — booking a free
 * trial. The visitor has a slot selected and their details typed in; opening
 * a link signs in a different tab and leaves that state behind in this one.
 * A code they can type keeps them where they are.
 *
 * The link stays below it, because the admin fallback sign-in and the student
 * account both send this same email and both expect a link. Either one works;
 * whichever the reader reaches for is the right one.
 */
interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  /** The one-time code (Supabase sends 6-10 digits by project setting). */
  token?: string | undefined
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
  token,
}: MagicLinkEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>
      {token ? `Codul tău pentru ${siteName}: ${token}` : `Linkul tău de autentificare pentru ${siteName}`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{token ? 'Codul tău de confirmare' : 'Linkul tău de autentificare'}</Heading>
        {token ? (
          <>
            <Text style={text}>
              Scrie codul de mai jos în pagina pe care ai lăsat-o deschisă, ca
              să confirmăm adresa ta de email.
            </Text>
            <Text style={codeStyle}>{token}</Text>
            <Text style={text}>
              Sau, dacă preferi, apasă butonul — se deschide o pagină nouă și te
              autentifică direct.
            </Text>
          </>
        ) : (
          <Text style={text}>
            Apasă butonul de mai jos pentru a te autentifica la {siteName}.
            Acest link va expira în scurt timp.
          </Text>
        )}
        <Button style={button} href={confirmationUrl}>
          Autentifică-te
        </Button>
        <Text style={footer}>
          {token
            ? 'Codul și linkul expiră în scurt timp. Dacă nu ai cerut nimic, poți ignora acest email.'
            : 'Dacă nu ai cerut acest link, poți ignora acest email.'}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
