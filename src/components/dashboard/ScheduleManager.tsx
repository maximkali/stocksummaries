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
}

const DAYS: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'monday', label: 'Monday', short: 'M' },
  { value: 'tuesday', label: 'Tuesday', short: 'T' },
  { value: 'wednesday', label: 'Wednesday', short: 'W' },
  { value: 'thursday', label: 'Thursday', short: 'T' },
  { value: 'friday', label: 'Friday', short: 'F' },
  { value: 'saturday', label: 'Saturday', short: 'S' },
  { value: 'sunday', label: 'Sunday', short: 'S' },
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
}: ScheduleManagerProps) {
  const handleFrequencyChange = (newFrequency: ScheduleFrequency) => {
    let newDays = days
    if (newFrequency === 'daily') {
      newDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    } else if (newFrequency === 'weekly') {
      newDays = ['monday']
    }
    onScheduleChange({ schedule_frequency: newFrequency, schedule_days: newDays })
  }

  const handleDayToggle = (day: DayOfWeek) => {
    const newDays = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day]

    // Ensure at least one day is selected
    if (newDays.length === 0) return
    onScheduleChange({ schedule_days: newDays })
  }

  const handleTimeChange = (newTime: string) => {
    onScheduleChange({ schedule_time: newTime })
  }

  const handleTimezoneChange = (newTimezone: string) => {
    onScheduleChange({ timezone: newTimezone })
  }

  return (
    <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Email Schedule</h2>
        <p className="text-gray-400 text-sm mt-1">
          Choose when to receive your stock digests
        </p>
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
      </div>

      {/* Day Selection (for weekly/custom) */}
      {(frequency === 'weekly' || frequency === 'custom') && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            {frequency === 'weekly' ? 'Day of Week' : 'Select Days'}
          </label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => (
              <button
                key={day.value}
                onClick={() => handleDayToggle(day.value)}
                className={`w-12 h-12 rounded-xl font-medium transition-all flex items-center justify-center ${
                  days.includes(day.value)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
                title={day.label}
              >
                <span className="hidden sm:inline">{day.short}</span>
                <span className="sm:hidden">{day.label.slice(0, 2)}</span>
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-2">
            {days.length === 0
              ? 'Select at least one day'
              : days.length === 7
              ? 'Every day'
              : days.length === 5 && !days.includes('saturday') && !days.includes('sunday')
              ? 'Weekdays only'
              : `${days.length} day${days.length > 1 ? 's' : ''} per week`}
          </p>
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
            <p className="text-white font-medium">
              {frequency === 'daily'
                ? 'Every day'
                : frequency === 'weekly'
                ? `Every ${DAYS.find((d) => d.value === days[0])?.label || 'week'}`
                : `${days.length} days per week`}
            </p>
            <p className="text-gray-400 text-sm">
              at {TIME_OPTIONS.find((t) => t.value === time)?.label || time} ({COMMON_TIMEZONES.find((t) => t.value === timezone)?.label || timezone})
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
