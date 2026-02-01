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
  // Use Resend's test domain for development, or your verified domain for production
  const fromAddress = process.env.NODE_ENV === 'production'
    ? 'Stock Summaries <digest@stocksummaries.app>'
    : 'Stock Summaries <onboarding@resend.dev>'

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
