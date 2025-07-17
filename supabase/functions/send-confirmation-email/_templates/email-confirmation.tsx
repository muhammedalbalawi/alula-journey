import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface EmailConfirmationProps {
  confirmation_url: string
  user_email: string
}

export const EmailConfirmationTemplate = ({
  confirmation_url,
  user_email,
}: EmailConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Confirm your email address for AlulaJourney</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to AlulaJourney!</Heading>
        <Text style={text}>
          Thank you for signing up. Please confirm your email address to complete your registration and start exploring the magic of AlUla.
        </Text>
        <Link
          href={confirmation_url}
          target="_blank"
          style={{
            ...button,
            display: 'block',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          Confirm Email Address
        </Link>
        <Text style={text}>
          Or copy and paste this link in your browser:
        </Text>
        <Text style={code}>{confirmation_url}</Text>
        <Text style={footerText}>
          If you didn't create an account with AlulaJourney, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          <Link
            href="https://alulajourney.icu"
            target="_blank"
            style={{ ...link, color: '#898989' }}
          >
            AlulaJourney
          </Link>
          <br />
          Discover the Magic of AlUla
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailConfirmationTemplate

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '40px',
  width: '600px',
  maxWidth: '100%',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const button = {
  backgroundColor: '#d4a574',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 24px',
  textDecoration: 'none',
  margin: '24px 0',
}

const link = {
  color: '#d4a574',
  textDecoration: 'underline',
}

const code = {
  backgroundColor: '#f4f4f4',
  border: '1px solid #e1e1e1',
  borderRadius: '4px',
  color: '#333',
  fontSize: '14px',
  padding: '12px',
  wordBreak: 'break-all' as const,
  margin: '16px 0',
}

const footerText = {
  color: '#8a8a8a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 16px',
}

const footer = {
  color: '#8a8a8a',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
  textAlign: 'center' as const,
}