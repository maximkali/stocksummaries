'use client'

import type { ScheduleFrequency, DayOfWeek } from '@/lib/types'

interface ScheduleManagerProps {
  frequency: ScheduleFrequency
  time: string
  days: DayOfWeek[]
  timezone: string
  onScheduleChange: (updates: {
    schedule_frequency?: ScheduleFrequency
    schedule_time?: string
    schedule_days?: DayOfWeek[]
    timezone?: string
  }) => void
  saving?: boolean
  saveMessage?: string | null
}

// Sunday-Saturday order (US standard)
const DAYS: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'sunday', label: 'Sunday', short: 'Su' },
  { value: 'monday', label: 'Monday', short: 'Mo' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tu' },
  { value: 'wednesday', label: 'Wednesday', short: 'We' },
  { value: 'thursday', label: 'Thursday', short: 'Th' },
  { value: 'friday', label: 'Friday', short: 'Fr' },
  { value: 'saturday', label: 'Saturday', short: 'Sa' },
]

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return {
    value: `${hour}:00`,
    label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : 'PM'}`,
  }
})

const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
]

export default function ScheduleManager({
  frequency,
  time,
  days,
  timezone,
  onScheduleChange,
  saving,
  saveMessage,
}: ScheduleManagerProps) {
  const handleFrequencyChange = (newFrequency: ScheduleFrequency) => {
    let newDays = days

    if (newFrequency === 'daily') {
      // Weekdays only (Monday-Friday)
      newDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    } else if (newFrequency === 'weekly') {
      // Single day - keep first selected day or default to Sunday
      newDays = days.length > 0 ? [days[0]] : ['sunday']
    } else if (newFrequency === 'custom') {
      // Need at least 2 days for custom
      if (days.length < 2) {
        // If coming from weekly with 1 day, add Monday (or next day)
        const currentDay = days[0] || 'sunday'
        const currentIndex = DAYS.findIndex(d => d.value === currentDay)
        const nextIndex = (currentIndex + 1) % 7
        newDays = [currentDay, DAYS[nextIndex].value]
      }
    }

    onScheduleChange({ schedule_frequency: newFrequency, schedule_days: newDays })
  }

  const handleDayToggle = (day: DayOfWeek) => {
    if (frequency === 'weekly') {
      // Radio behavior - only one day can be selected
      onScheduleChange({ schedule_days: [day] })
    } else if (frequency === 'custom') {
      // Checkbox behavior - toggle, but maintain minimum of 2 days
      const newDays = days.includes(day)
        ? days.filter((d) => d !== day)
        : [...days, day]

      // Ensure at least 2 days are selected for custom
      if (newDays.length < 2) return
      onScheduleChange({ schedule_days: newDays })
    }
  }

  const handleTimeChange = (newTime: string) => {
    onScheduleChange({ schedule_time: newTime })
  }

  const handleTimezoneChange = (newTimezone: string) => {
    onScheduleChange({ timezone: newTimezone })
  }

  // Get preview text
  const getPreviewText = () => {
    if (frequency === 'daily') {
      return 'Every weekday'
    } else if (frequency === 'weekly') {
      const dayLabel = DAYS.find((d) => d.value === days[0])?.label || 'week'
      return `Every ${dayLabel}`
    } else {
      // Custom - show which days
      const sortedDays = DAYS.filter(d => days.includes(d.value))
      if (sortedDays.length === 5 &&
          !days.includes('saturday') &&
          !days.includes('sunday')) {
        return 'Weekdays'
      }
      if (sortedDays.length === 2 &&
          days.includes('saturday') &&
          days.includes('sunday')) {
        return 'Weekends'
      }
      return sortedDays.map(d => d.label).join(', ')
    }
  }

  return (
    <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Email Schedule</h2>
          <p className="text-gray-400 text-sm mt-1">
            Choose when to receive your stock digests
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            <span className={`text-sm ${saveMessage === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>

      {/* Frequency Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Frequency
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['daily', 'weekly', 'custom'] as ScheduleFrequency[]).map((freq) => (
            <button
              key={freq}
              onClick={() => handleFrequencyChange(freq)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                frequency === freq
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-2">
          {frequency === 'daily' && 'Receive updates Monday through Friday'}
          {frequency === 'weekly' && 'Pick one day per week'}
          {frequency === 'custom' && 'Select two or more days per week'}
        </p>
      </div>

      {/* Day Selection (for weekly/custom only) */}
      {frequency !== 'daily' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            {frequency === 'weekly' ? 'Day of Week' : 'Select Days'}
          </label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => (
              <button
                key={day.value}
                onClick={() => handleDayToggle(day.value)}
                className={`w-12 h-12 rounded-xl font-medium transition-all flex items-center justify-center text-sm ${
                  days.includes(day.value)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
                title={day.label}
              >
                {day.short}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Delivery Time
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
          >
            {TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-800">
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value} className="bg-slate-800">
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">{getPreviewText()}</p>
            <p className="text-gray-400 text-sm">
              at {TIME_OPTIONS.find((t) => t.value === time)?.label || time} ({COMMON_TIMEZONES.find((t) => t.value === timezone)?.label || timezone})
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
