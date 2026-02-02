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
  const [savingTickers, setSavingTickers] = useState(false)
  const [tickerSaveMessage, setTickerSaveMessage] = useState<string | null>(null)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [scheduleSaveMessage, setScheduleSaveMessage] = useState<string | null>(null)
  const [sendingDigest, setSendingDigest] = useState(false)
  const [digestMessage, setDigestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  const defaultProfile: Partial<UserProfile> = {
    tickers: [],
    schedule_frequency: 'daily',
    schedule_time: '08:00',
    schedule_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    emails_paused: false,
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
    await saveProfile({ tickers: newTickers }, 'tickers')
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
    await saveProfile(updates, 'schedule')
  }

  const handleTogglePaused = async () => {
    const newPausedState = !currentProfile.emails_paused
    setProfile((prev) => {
      if (prev) {
        return { ...prev, emails_paused: newPausedState }
      }
      return { ...defaultProfile, id: user.id, email: user.email || '', emails_paused: newPausedState } as UserProfile
    })

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        emails_paused: newPausedState,
      }, {
        onConflict: 'id'
      })

    if (error) {
      // Revert on error
      setProfile((prev) => prev ? { ...prev, emails_paused: !newPausedState } : prev)
      console.error('Error toggling pause state:', error)
    }
  }

  const saveProfile = async (updates: Partial<UserProfile>, section: 'tickers' | 'schedule') => {
    if (section === 'tickers') {
      setSavingTickers(true)
      setTickerSaveMessage(null)
    } else {
      setSavingSchedule(true)
      setScheduleSaveMessage(null)
    }

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
      if (section === 'tickers') {
        setTickerSaveMessage('Failed to save')
      } else {
        setScheduleSaveMessage('Failed to save')
      }
      console.error('Error saving profile:', error)
    } else {
      if (section === 'tickers') {
        setTickerSaveMessage('Saved')
        setTimeout(() => setTickerSaveMessage(null), 3000)
      } else {
        setScheduleSaveMessage('Saved')
        setTimeout(() => setScheduleSaveMessage(null), 3000)
      }
    }

    if (section === 'tickers') {
      setSavingTickers(false)
    } else {
      setSavingSchedule(false)
    }
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

          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Account Section */}
        <section className="text-center mb-12">
          <p className="text-gray-400 mb-2">Signed in as</p>
          <p className="text-white text-xl font-medium">{user.email}</p>
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
                {currentProfile.emails_paused ? (
                  <>
                    <p className="text-yellow-400 text-sm">Emails paused</p>
                    <p className="text-white text-lg font-semibold">No digests will be sent</p>
                  </>
                ) : nextEmail && currentProfile.tickers.length > 0 ? (
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
          
          {/* Email Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-white font-medium">Scheduled emails</p>
              <p className="text-gray-400 text-sm">
                {currentProfile.emails_paused ? 'Paused – no digests will be sent' : 'Active – digests will be sent on schedule'}
              </p>
            </div>
            <button
              onClick={handleTogglePaused}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                currentProfile.emails_paused ? 'bg-gray-600' : 'bg-green-500'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  currentProfile.emails_paused ? 'left-1' : 'left-7'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Ticker Manager */}
        <TickerManager
          tickers={currentProfile.tickers || []}
          onTickersChange={handleTickersChange}
          saving={savingTickers}
          saveMessage={tickerSaveMessage}
        />

        {/* Schedule Manager */}
        <div className={`relative ${currentProfile.emails_paused ? 'pointer-events-none' : ''}`}>
          {currentProfile.emails_paused && (
            <div className="absolute inset-0 bg-black/60 rounded-2xl z-10 flex items-center justify-center">
              <p className="text-gray-300 font-medium">Emails paused</p>
            </div>
          )}
          <div className={currentProfile.emails_paused ? 'opacity-40' : ''}>
            <ScheduleManager
              frequency={currentProfile.schedule_frequency}
              time={currentProfile.schedule_time?.slice(0, 5) || '08:00'}
              days={currentProfile.schedule_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}
              timezone={currentProfile.timezone || 'America/New_York'}
              onScheduleChange={handleScheduleChange}
              saving={savingSchedule}
              saveMessage={scheduleSaveMessage}
            />
          </div>
        </div>

        {/* Recent Digests */}
        <RecentDigests digests={recentDigests} />
      </main>
    </div>
  )
}
