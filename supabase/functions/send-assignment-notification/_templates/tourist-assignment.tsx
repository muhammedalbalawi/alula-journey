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

interface TouristAssignmentEmailProps {
  touristName: string
  guideName: string
  guideEmail: string
  tourName: string
  startDate: string
  endDate: string
}

export const TouristAssignmentEmail = ({
  touristName,
  guideName,
  guideEmail,
  tourName,
  startDate,
  endDate,
}: TouristAssignmentEmailProps) => (
  <Html>
    <Head />
    <Preview>Your tour guide has been assigned - AlulaJourney</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Tour Guide Assigned!</Heading>
        <Text style={text}>
          Dear {touristName},
        </Text>
        <Text style={text}>
          Great news! We have assigned a tour guide for your upcoming AlUla experience.
        </Text>
        <div style={tourDetails}>
          <Text style={detailItem}><strong>Tour:</strong> {tourName}</Text>
          <Text style={detailItem}><strong>Guide:</strong> {guideName}</Text>
          <Text style={detailItem}><strong>Guide Email:</strong> {guideEmail}</Text>
          <Text style={detailItem}><strong>Start Date:</strong> {startDate}</Text>
          <Text style={detailItem}><strong>End Date:</strong> {endDate}</Text>
        </div>
        <Text style={text}>
          Your guide will contact you soon to discuss the details of your tour. You can also reach out to them directly using the email provided above.
        </Text>
        <Text style={text}>
          We're excited for you to discover the magic of AlUla!
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

export default TouristAssignmentEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
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

const tourDetails = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
}

const detailItem = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
}

const link = {
  color: '#d4a574',
  textDecoration: 'underline',
}

const footer = {
  color: '#8a8a8a',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
  textAlign: 'center' as const,
}