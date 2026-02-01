import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { StockResearchResult } from '@/lib/grok'

interface StockDigestEmailProps {
  stocks: StockResearchResult[]
  userName?: string
}

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'bullish':
      return '#10B981'
    case 'bearish':
      return '#EF4444'
    default:
      return '#6B7280'
  }
}

const getSentimentEmoji = (sentiment: string) => {
  switch (sentiment) {
    case 'bullish':
      return '📈'
    case 'bearish':
      return '📉'
    default:
      return '➡️'
  }
}

export default function StockDigestEmail({ stocks, userName }: StockDigestEmailProps) {
  const previewText = `Your stock digest: ${stocks.map(s => s.ticker).join(', ')}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Stock Summaries</Heading>
            <Text style={tagline}>Your personalized market intelligence</Text>
          </Section>

          {/* Greeting */}
          <Section style={greetingSection}>
            <Text style={greeting}>
              {userName ? `Hey ${userName.split('@')[0]}` : 'Hey there'} 👋
            </Text>
            <Text style={intro}>
              Here&apos;s what&apos;s happening with your watchlist. No fluff, just the signal.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Stocks */}
          {stocks.map((stock, index) => (
            <Section key={stock.ticker} style={stockSection}>
              {/* Stock Header */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tr>
                  <td>
                    <Heading style={stockTicker}>
                      {stock.ticker}
                      <span style={{ ...sentimentBadge, backgroundColor: getSentimentColor(stock.sentiment) }}>
                        {getSentimentEmoji(stock.sentiment)} {stock.sentiment}
                      </span>
                    </Heading>
                    <Text style={companyName}>{stock.companyName}</Text>
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                    <Text style={price}>{stock.currentPrice}</Text>
                    <Text style={{
                      ...priceChange,
                      color: stock.priceChange.day.startsWith('+') ? '#10B981' : stock.priceChange.day.startsWith('-') ? '#EF4444' : '#6B7280'
                    }}>
                      {stock.priceChange.day} today
                    </Text>
                  </td>
                </tr>
              </table>

              {/* Price Performance */}
              <table style={performanceTable}>
                <tr>
                  <td style={performanceCell}>
                    <Text style={performanceLabel}>Week</Text>
                    <Text style={{
                      ...performanceValue,
                      color: stock.priceChange.week.startsWith('+') ? '#10B981' : stock.priceChange.week.startsWith('-') ? '#EF4444' : '#6B7280'
                    }}>
                      {stock.priceChange.week}
                    </Text>
                  </td>
                  <td style={performanceCell}>
                    <Text style={performanceLabel}>Month</Text>
                    <Text style={{
                      ...performanceValue,
                      color: stock.priceChange.month.startsWith('+') ? '#10B981' : stock.priceChange.month.startsWith('-') ? '#EF4444' : '#6B7280'
                    }}>
                      {stock.priceChange.month}
                    </Text>
                  </td>
                </tr>
              </table>

              {/* Summary */}
              <Section style={summaryBox}>
                <Text style={summaryText}>{stock.summary}</Text>
              </Section>

              {/* Key Events */}
              {stock.keyEvents.length > 0 && stock.keyEvents[0] !== 'Unable to fetch data' && (
                <Section style={detailSection}>
                  <Text style={detailLabel}>Key Events</Text>
                  {stock.keyEvents.map((event, i) => (
                    <Text key={i} style={bulletPoint}>• {event}</Text>
                  ))}
                </Section>
              )}

              {/* Other Details */}
              {stock.insiderActivity !== 'No significant activity' && stock.insiderActivity !== 'N/A' && (
                <Section style={detailSection}>
                  <Text style={detailLabel}>Insider Activity</Text>
                  <Text style={detailText}>{stock.insiderActivity}</Text>
                </Section>
              )}

              {stock.analystActions !== 'No significant actions' && stock.analystActions !== 'N/A' && (
                <Section style={detailSection}>
                  <Text style={detailLabel}>Analyst Actions</Text>
                  <Text style={detailText}>{stock.analystActions}</Text>
                </Section>
              )}

              {stock.competitiveDynamics !== 'No significant changes' && stock.competitiveDynamics !== 'N/A' && (
                <Section style={detailSection}>
                  <Text style={detailLabel}>Competitive Dynamics</Text>
                  <Text style={detailText}>{stock.competitiveDynamics}</Text>
                </Section>
              )}

              {stock.upcomingCatalysts !== 'None imminent' && stock.upcomingCatalysts !== 'N/A' && (
                <Section style={detailSection}>
                  <Text style={detailLabel}>Upcoming Catalysts</Text>
                  <Text style={detailText}>{stock.upcomingCatalysts}</Text>
                </Section>
              )}

              {index < stocks.length - 1 && <Hr style={stockDivider} />}
            </Section>
          ))}

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Powered by AI. Always do your own research before investing.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={footerLink}>
                Manage Watchlist
              </Link>
              {' • '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={footerLink}>
                Update Schedule
              </Link>
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} Stock Summaries
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#0F172A',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  color: '#FFFFFF',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  background: 'linear-gradient(135deg, #A855F7, #EC4899)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const tagline = {
  color: '#94A3B8',
  fontSize: '14px',
  margin: '0',
}

const greetingSection = {
  marginBottom: '24px',
}

const greeting = {
  color: '#FFFFFF',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const intro = {
  color: '#94A3B8',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
}

const divider = {
  borderColor: '#334155',
  margin: '32px 0',
}

const stockSection = {
  marginBottom: '32px',
}

const stockTicker = {
  color: '#FFFFFF',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const sentimentBadge = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: '600',
  padding: '4px 10px',
  borderRadius: '12px',
  color: '#FFFFFF',
  textTransform: 'uppercase' as const,
  marginLeft: '12px',
  verticalAlign: 'middle',
}

const companyName = {
  color: '#94A3B8',
  fontSize: '14px',
  margin: '0',
}

const price = {
  color: '#FFFFFF',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
}

const priceChange = {
  fontSize: '14px',
  fontWeight: '600',
  margin: '4px 0 0 0',
}

const performanceTable = {
  width: '100%',
  marginTop: '16px',
  backgroundColor: '#1E293B',
  borderRadius: '12px',
  padding: '16px',
}

const performanceCell = {
  width: '50%',
  textAlign: 'center' as const,
}

const performanceLabel = {
  color: '#64748B',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
}

const performanceValue = {
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const summaryBox = {
  backgroundColor: '#1E293B',
  borderRadius: '12px',
  padding: '16px',
  marginTop: '16px',
  borderLeft: '4px solid #A855F7',
}

const summaryText = {
  color: '#E2E8F0',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
}

const detailSection = {
  marginTop: '16px',
}

const detailLabel = {
  color: '#A855F7',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px 0',
}

const detailText = {
  color: '#CBD5E1',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const bulletPoint = {
  color: '#CBD5E1',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 4px 0',
  paddingLeft: '8px',
}

const stockDivider = {
  borderColor: '#334155',
  margin: '32px 0',
  borderStyle: 'dashed',
}

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
}

const footerText = {
  color: '#64748B',
  fontSize: '13px',
  margin: '0 0 16px 0',
}

const footerLinks = {
  color: '#94A3B8',
  fontSize: '13px',
  margin: '0 0 16px 0',
}

const footerLink = {
  color: '#A855F7',
  textDecoration: 'none',
}

const copyright = {
  color: '#475569',
  fontSize: '12px',
  margin: '0',
}
