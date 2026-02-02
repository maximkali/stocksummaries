import OpenAI from 'openai'
import { getServerEnv } from '@/lib/env'

function getGrokClient(): OpenAI {
  const apiKey = getServerEnv('GROK_API_KEY')
  // Debug: show masked API key
  console.log('=== GROK API DEBUG ===')
  console.log('API Key (masked):', apiKey.slice(0, 8) + '***' + apiKey.slice(-4))
  console.log('API Key length:', apiKey.length)
  console.log('Base URL: https://api.x.ai/v1')
  console.log('======================')
  
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  })
}

export interface StockResearchResult {
  ticker: string
  companyName: string
  currentPrice: string
  priceChange: {
    day: string
    week: string
    month: string
  }
  sentiment: 'bullish' | 'bearish' | 'neutral'
  keyEvents: string[]
  competitiveDynamics: string
  insiderActivity: string
  analystActions: string
  upcomingCatalysts: string
  summary: string
}

export async function researchStock(
  ticker: string,
  lastEmailSent: Date | null
): Promise<StockResearchResult> {
  const timePeriod = lastEmailSent
    ? `since ${lastEmailSent.toISOString().split('T')[0]}`
    : 'in the past week'

  const prompt = `You are a no-BS financial analyst. Research ${ticker} and provide a concise, actionable summary of everything important that happened ${timePeriod}.

Cut through the noise. I don't want fluff or speculation - just facts and significant developments.

Cover these areas if there's anything noteworthy:

1. **Price Action**: Current share price, % change today, week-to-date, and month-to-date
2. **Key Events**: Earnings, guidance changes, product launches, partnerships, regulatory news
3. **Insider Activity**: Any significant insider buys or sells (include names and amounts if material)
4. **Analyst Actions**: Upgrades, downgrades, price target changes (only significant ones)
5. **Competitive Dynamics**: Market share shifts, competitor moves affecting this company
6. **Upcoming Catalysts**: Earnings dates, FDA decisions, product releases, etc.

Format your response as JSON with this structure:
{
  "ticker": "${ticker}",
  "companyName": "Full company name",
  "currentPrice": "$XXX.XX",
  "priceChange": {
    "day": "+X.X%",
    "week": "+X.X%",
    "month": "+X.X%"
  },
  "sentiment": "bullish" | "bearish" | "neutral",
  "keyEvents": ["Event 1", "Event 2"],
  "competitiveDynamics": "Brief summary or 'No significant changes'",
  "insiderActivity": "Brief summary or 'No significant activity'",
  "analystActions": "Brief summary or 'No significant actions'",
  "upcomingCatalysts": "Brief summary or 'None imminent'",
  "summary": "2-3 sentence bottom line summary"
}

Be direct. Be useful. Skip anything that doesn't matter.`

  const grok = getGrokClient()
  console.log('Calling Grok API for ticker:', ticker)
  console.log('Model: grok-4-fast-reasoning')
  
  let response
  try {
    response = await grok.chat.completions.create({
      model: 'grok-4-fast-reasoning',
      messages: [
        {
          role: 'system',
          content: 'You are a financial research assistant that provides concise, factual stock analysis. Always respond with valid JSON only, no markdown code blocks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    })
  } catch (error) {
    console.error('=== GROK API ERROR ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    if (error && typeof error === 'object' && 'status' in error) {
      console.error('HTTP Status:', (error as { status: number }).status)
    }
    if (error && typeof error === 'object' && 'response' in error) {
      const resp = (error as { response?: { data?: unknown } }).response
      console.error('Response data:', JSON.stringify(resp?.data, null, 2))
    }
    console.error('======================')
    throw error
  }

  const content = response.choices[0]?.message?.content || '{}'

  try {
    // Clean up potential markdown formatting
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleanedContent) as StockResearchResult
  } catch {
    // Fallback if parsing fails
    return {
      ticker,
      companyName: ticker,
      currentPrice: 'N/A',
      priceChange: { day: 'N/A', week: 'N/A', month: 'N/A' },
      sentiment: 'neutral',
      keyEvents: ['Unable to fetch data'],
      competitiveDynamics: 'N/A',
      insiderActivity: 'N/A',
      analystActions: 'N/A',
      upcomingCatalysts: 'N/A',
      summary: 'Unable to generate summary. Please try again later.',
    }
  }
}

export async function researchMultipleStocks(
  tickers: string[],
  lastEmailSent: Date | null
): Promise<StockResearchResult[]> {
  const results = await Promise.all(
    tickers.map((ticker) => researchStock(ticker, lastEmailSent))
  )
  return results
}
