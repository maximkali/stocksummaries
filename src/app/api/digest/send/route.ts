import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { researchMultipleStocks } from '@/lib/grok'
import { sendStockDigest } from '@/lib/email'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
    }

    if (!profile || !profile.tickers || profile.tickers.length === 0) {
      return NextResponse.json({ error: 'No tickers configured' }, { status: 400 })
    }

    // Get last digest to determine time period
    const { data: lastDigest } = await supabase
      .from('digests')
      .select('sent_at')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single()

    const lastEmailSent = lastDigest ? new Date(lastDigest.sent_at) : null

    // Research stocks using Grok
    const stockResults = await researchMultipleStocks(profile.tickers, lastEmailSent)

    // Send email
    await sendStockDigest(user.email!, stockResults)

    // Store digest in database
    const digestContent = stockResults
      .map((s) => `${s.ticker}: ${s.summary}`)
      .join('\n\n')

    const { error: insertError } = await supabase.from('digests').insert({
      user_id: user.id,
      tickers: profile.tickers,
      content: digestContent,
      sent_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Error storing digest:', insertError)
      // Don't fail the request since email was sent successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Digest sent successfully',
      tickers: profile.tickers,
    })
  } catch (error) {
    // Log full error for debugging
    console.error('Error sending digest:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send digest' },
      { status: 500 }
    )
  }
}
