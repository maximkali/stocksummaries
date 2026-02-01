'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserProfile, Digest, DayOfWeek, ScheduleFrequency } from '@/lib/types'
import TickerManager from './TickerManager'
import ScheduleManager from './ScheduleManager'
import RecentDigests from './RecentDigests'

interface DashboardClientProps {
  user: User
  initialProfile: UserProfile | null
  recentDigests: Digest[]
}

export default function DashboardClient({ user, initialProfile, recentDigests }: DashboardClientProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [sendingDigest, setSendingDigest] = useState(false)
  const [digestMessage, setDigestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const defaultProfile: Partial<UserProfile> = {
    tickers: [],
    schedule_frequency: 'daily',
    schedule_time: '08:00',
    schedule_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }

  const currentProfile = profile || { ...defaultProfile, id: user.id, email: user.email || '' } as UserProfile

  const handleTickersChange = async (newTickers: string[]) => {
    // Update local state immediately for responsive UI
    setProfile((prev) => {
      if (prev) {
        return { ...prev, tickers: newTickers }
      }
      // Create new profile object if none exists
      return { ...defaultProfile, id: user.id, email: user.email || '', tickers: newTickers } as UserProfile
    })
    await saveProfile({ tickers: newTickers })
  }

  const handleScheduleChange = async (updates: {
    schedule_frequency?: ScheduleFrequency
    schedule_time?: string
    schedule_days?: DayOfWeek[]
    timezone?: string
  }) => {
    // Update local state immediately for responsive UI
    setProfile((prev) => {
      if (prev) {
        return { ...prev, ...updates }
      }
      // Create new profile object if none exists
      return { ...defaultProfile, id: user.id, email: user.email || '', ...updates } as UserProfile
    })
    await saveProfile(updates)
  }

  const saveProfile = async (updates: Partial<UserProfile>) => {
    setSaving(true)
    setSaveMessage(null)

    // Use upsert to handle both new and existing profiles
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        ...updates,
      }, {
        onConflict: 'id'
      })

    if (error) {
      setSaveMessage('Failed to save changes')
      console.error('Error saving profile:', error)
    } else {
      setSaveMessage('Changes saved!')
      setTimeout(() => setSaveMessage(null), 2000)
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Calculate next email time
  const getNextEmailTime = () => {
    if (!profile?.schedule_time) return null

    const now = new Date()
    const [hours, minutes] = profile.schedule_time.split(':').map(Number)
    const days = profile.schedule_days || []

    if (profile.schedule_frequency === 'daily') {
      const next = new Date()
      next.setHours(hours, minutes, 0, 0)
      if (next <= now) {
        next.setDate(next.getDate() + 1)
      }
      return next
    }

    // Weekly or custom
    const dayMap: Record<DayOfWeek, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6
    }

    const scheduledDayNumbers = days.map(d => dayMap[d]).sort((a, b) => a - b)
    const currentDay = now.getDay()

    for (const dayNum of scheduledDayNumbers) {
      const next = new Date()
      const daysUntil = (dayNum - currentDay + 7) % 7
      next.setDate(now.getDate() + daysUntil)
      next.setHours(hours, minutes, 0, 0)
      if (next > now) {
        return next
      }
    }

    // Next week
    if (scheduledDayNumbers.length > 0) {
      const next = new Date()
      const daysUntil = (scheduledDayNumbers[0] - currentDay + 7) % 7 || 7
      next.setDate(now.getDate() + daysUntil)
      next.setHours(hours, minutes, 0, 0)
      return next
    }

    return null
  }

  const nextEmail = getNextEmailTime()

  const handleSendDigestNow = async () => {
    if (currentProfile.tickers.length === 0) {
      setDigestMessage({ type: 'error', text: 'Add some tickers first!' })
      setTimeout(() => setDigestMessage(null), 3000)
      return
    }

    setSendingDigest(true)
    setDigestMessage(null)

    try {
      const response = await fetch('/api/digest/send', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send digest')
      }

      setDigestMessage({ type: 'success', text: 'Digest sent! Check your email.' })
    } catch (error) {
      setDigestMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send digest',
      })
    } finally {
      setSendingDigest(false)
      setTimeout(() => setDigestMessage(null), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Stock Summaries</span>
          </div>

          <div className="flex items-center gap-4">
            {saving && (
              <span className="text-sm text-purple-400 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            )}
            {saveMessage && !saving && (
              <span className="text-sm text-green-400">{saveMessage}</span>
            )}
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-gray-400">
            Manage your watchlist and email preferences
          </p>
        </section>

        {/* Send Digest Now Card */}
        <section className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                {nextEmail && currentProfile.tickers.length > 0 ? (
                  <>
                    <p className="text-gray-400 text-sm">Next scheduled digest</p>
                    <p className="text-white text-lg font-semibold">
                      {nextEmail.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {nextEmail.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm">No digest scheduled</p>
                    <p className="text-white text-lg font-semibold">Add tickers to get started</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleSendDigestNow}
                disabled={sendingDigest || currentProfile.tickers.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                {sendingDigest ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Digest Now
                  </>
                )}
              </button>
              {digestMessage && (
                <span className={`text-sm ${digestMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {digestMessage.text}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Ticker Manager */}
        <TickerManager
          tickers={currentProfile.tickers}
          onTickersChange={handleTickersChange}
        />

        {/* Schedule Manager */}
        <ScheduleManager
          frequency={currentProfile.schedule_frequency}
          time={currentProfile.schedule_time}
          days={currentProfile.schedule_days}
          timezone={currentProfile.timezone}
          onScheduleChange={handleScheduleChange}
        />

        {/* Recent Digests */}
        <RecentDigests digests={recentDigests} />
      </main>
    </div>
  )
}
