/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

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
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Confirmă-ți emailul pentru {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirmă-ți emailul</Heading>
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
        <Button style={button} href={confirmationUrl}>
          Confirmă emailul
        </Button>
        <Text style={footer}>
          Dacă nu ți-ai creat un cont, poți ignora acest email.
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
const footer = { fontSize: '13px', color: 'hsl(220, 9%, 55%)', margin: '32px 0 0', lineHeight: '1.5' }
