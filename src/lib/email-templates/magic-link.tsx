import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="ro" dir="ltr">
    <Head />
    <Preview>Linkul tău de autentificare pentru {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Linkul tău de autentificare</Heading>
        <Text style={text}>
          Apasă butonul de mai jos pentru a te autentifica la {siteName}.
          Acest link va expira în scurt timp.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Autentifică-te
        </Button>
        <Text style={footer}>
          Dacă nu ai cerut acest link, poți ignora acest email.
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
const footer = { fontSize: '13px', color: 'hsl(220, 9%, 55%)', margin: '32px 0 0', lineHeight: '1.5' }
