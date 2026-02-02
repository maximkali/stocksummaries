export type ScheduleFrequency = 'daily' | 'weekly' | 'custom'

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface UserProfile {
  id: string
  email: string
  tickers: string[]
  schedule_frequency: ScheduleFrequency
  schedule_time: string // HH:MM format in UTC
  schedule_days: DayOfWeek[] // for weekly/custom
  timezone: string
  emails_paused: boolean
  created_at: string
  updated_at: string
}

export interface Digest {
  id: string
  user_id: string
  tickers: string[]
  content: string
  sent_at: string
  created_at: string
}

export interface StockSummary {
  ticker: string
  summary: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  keyPoints: string[]
}
