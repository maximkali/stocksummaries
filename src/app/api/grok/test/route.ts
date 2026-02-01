import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { researchStock } from '@/lib/grok'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)

    if (!body || typeof body.ticker !== 'string' || !body.ticker.trim()) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const ticker = body.ticker.trim().toUpperCase()

    // Basic validation: ticker should be 1-5 uppercase letters
    if (!/^[A-Z]{1,5}$/.test(ticker)) {
      return NextResponse.json({ error: 'Invalid ticker format' }, { status: 400 })
    }

    const result = await researchStock(ticker, null)

    return NextResponse.json(result)
  } catch (error) {
    // Log full error for debugging but don't expose details to client
    console.error('Grok test error:', error)
    return NextResponse.json(
      { error: 'Failed to research stock' },
      { status: 500 }
    )
  }
}
