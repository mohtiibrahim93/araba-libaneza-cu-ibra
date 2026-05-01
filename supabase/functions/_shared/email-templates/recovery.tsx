/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Resetează-ți parola pentru {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Resetează-ți parola</Heading>
        <Text style={text}>
          Am primit o cerere de resetare a parolei pentru {siteName}. Apasă
          butonul de mai jos pentru a alege o parolă nouă.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Resetează parola
        </Button>
        <Text style={footer}>
          Dacă nu ai cerut resetarea parolei, poți ignora acest email.
          Parola ta nu va fi schimbată.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const footer = { fontSize: '13px', color: 'hsl(220, 9%, 55%)', margin: '32px 0 0', lineHeight: '1.5' }
