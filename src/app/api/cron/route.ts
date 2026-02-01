import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { researchMultipleStocks } from '@/lib/grok'
import { sendStockDigest } from '@/lib/email'
import { getServerEnv, getPublicEnv } from '@/lib/env'
import crypto from 'crypto'

function getSupabaseAdmin(): SupabaseClient {
  const url = getPublicEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = getServerEnv('SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key)
}

/**
 * Timing-safe comparison to prevent timing attacks on secret validation.
 * Uses constant-time comparison regardless of where strings differ.
 */
function timingSafeEqual(a: string, b: string): boolean {
  // Ensure both strings are the same length to prevent length-based timing attacks
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    // Compare with itself to maintain constant time even when lengths differ
    crypto.timingSafeEqual(aBuffer, aBuffer)
    return false
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer)
}

/**
 * Validate the cron authorization header.
 * Returns true if authorized, false otherwise.
 */
function validateCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return false
  }

  const expectedToken = `Bearer ${getServerEnv('CRON_SECRET')}`
  return timingSafeEqual(authHeader, expectedToken)
}

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

interface Profile {
  id: string
  email: string
  tickers: string[]
  schedule_frequency: string
  schedule_time: string
  schedule_days: string[]
  timezone: string
}

interface Digest {
  sent_at: string
}

export async function GET(request: NextRequest) {
  // Verify cron secret using timing-safe comparison
  if (!validateCronAuth(request)) {
    // Use generic error message to avoid revealing auth mechanism details
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const currentHour = now.getUTCHours().toString().padStart(2, '0')
    const currentMinute = Math.floor(now.getUTCMinutes() / 15) * 15 // Round to nearest 15 min
    const currentTime = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`

    // Get day of week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[now.getUTCDay()]

    console.log(`Cron running at ${currentTime} UTC on ${currentDay}`)

    const supabaseAdmin = getSupabaseAdmin()

    // Find users who should receive emails now
    const { data: eligibleUsers, error: queryError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .contains('schedule_days', [currentDay])
      .gte('schedule_time', `${currentHour}:00`)
      .lt('schedule_time', `${currentHour}:59`)
      .not('tickers', 'eq', '{}')

    if (queryError) {
      console.error('Error querying users:', queryError)
      // Don't expose internal error details
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return NextResponse.json({
        message: 'No users scheduled for this time',
        time: currentTime,
        day: currentDay,
        usersProcessed: 0
      })
    }

    console.log(`Found ${eligibleUsers.length} eligible users`)

    const results = []

    for (const user of eligibleUsers as Profile[]) {
      try {
        // Get last digest for this user to determine time period
        const { data: lastDigest } = await supabaseAdmin
          .from('digests')
          .select('sent_at')
          .eq('user_id', user.id)
          .order('sent_at', { ascending: false })
          .limit(1)
          .single()

        const lastEmailSent = lastDigest ? new Date((lastDigest as Digest).sent_at) : null

        // Research stocks using Grok
        console.log(`Researching stocks for user: ${user.tickers.join(', ')}`)
        const stockResults = await researchMultipleStocks(user.tickers, lastEmailSent)

        // Send email
        console.log(`Sending digest to user`)
        await sendStockDigest(user.email, stockResults)

        // Store digest in database
        const digestContent = stockResults
          .map((s) => `${s.ticker}: ${s.summary}`)
          .join('\n\n')

        await supabaseAdmin.from('digests').insert({
          user_id: user.id,
          tickers: user.tickers,
          content: digestContent,
          sent_at: new Date().toISOString(),
        })

        results.push({
          userId: user.id,
          status: 'success',
          tickers: user.tickers.length,
        })
      } catch (userError) {
        // Log full error internally but don't expose details
        console.error(`Error processing user ${user.id}:`, userError)
        results.push({
          userId: user.id,
          status: 'error',
        })
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      time: currentTime,
      day: currentDay,
      usersProcessed: eligibleUsers.length,
      results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
