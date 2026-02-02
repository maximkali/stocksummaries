import { Resend } from 'resend'
import StockDigestEmail from '@/emails/StockDigest'
import type { StockResearchResult } from '@/lib/grok'
import { getServerEnv } from '@/lib/env'

function getResendClient(): Resend {
  return new Resend(getServerEnv('RESEND_API_KEY'))
}

export async function sendStockDigest(
  to: string,
  stocks: StockResearchResult[]
) {
  const resend = getResendClient()
  // Use verified domain for sending emails
  const fromAddress = 'Stock Summaries <digest@stocksummaries.com>'

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: [to],
    subject: `Your Stock Digest: ${stocks.map(s => s.ticker).join(', ')}`,
    react: StockDigestEmail({ stocks, userName: to }),
  })

  if (error) {
    // Log error details internally
    console.error('Email send error:', JSON.stringify(error, null, 2))
    throw new Error(error.message || 'Failed to send email')
  }

  return data
}
