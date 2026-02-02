'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TickerManagerProps {
  tickers: string[]
  onTickersChange: (tickers: string[]) => void
  saving?: boolean
  saveMessage?: string | null
}

interface SortableTickerProps {
  ticker: string
  index: number
  onRemove: (ticker: string) => void
}

function SortableTicker({ ticker, index, onRemove }: SortableTickerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticker })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all ${
        isDragging ? 'shadow-2xl shadow-purple-500/20' : ''
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 -m-2 text-gray-500 hover:text-white transition-colors touch-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Rank */}
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
        {index + 1}
      </div>

      {/* Ticker Symbol */}
      <div className="flex-1">
        <span className="text-white font-semibold text-lg tracking-wide">{ticker}</span>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(ticker)}
        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        aria-label={`Remove ${ticker}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

export default function TickerManager({ tickers, onTickersChange, saving, saveMessage }: TickerManagerProps) {
  const [newTicker, setNewTicker] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tickers.indexOf(active.id as string)
      const newIndex = tickers.indexOf(over.id as string)
      onTickersChange(arrayMove(tickers, oldIndex, newIndex))
    }
  }

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const ticker = newTicker.toUpperCase().trim()

    if (!ticker) return

    if (!/^[A-Z]{1,5}$/.test(ticker)) {
      setError('Enter a valid ticker symbol (1-5 letters)')
      return
    }

    if (tickers.includes(ticker)) {
      setError('This ticker is already in your list')
      return
    }

    if (tickers.length >= 20) {
      setError('Maximum 20 tickers allowed')
      return
    }

    onTickersChange([...tickers, ticker])
    setNewTicker('')
  }

  const handleRemoveTicker = (ticker: string) => {
    onTickersChange(tickers.filter((t) => t !== ticker))
  }

  return (
    <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Your Watchlist</h2>
          <p className="text-gray-400 text-sm mt-1">
            Add tickers and drag to set priority order
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
          <div className="text-gray-400 text-sm">
            {tickers.length}/20 stocks
          </div>
        </div>
      </div>

      {/* Add Ticker Form */}
      <form onSubmit={handleAddTicker} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              placeholder="Enter ticker symbol (e.g., AAPL)"
              maxLength={5}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="hidden sm:inline">Add Ticker</span>
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </form>

      {/* Ticker List */}
      {tickers.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tickers} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tickers.map((ticker, index) => (
                <SortableTicker
                  key={ticker}
                  ticker={ticker}
                  index={index}
                  onRemove={handleRemoveTicker}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-gray-400">
            No tickers yet. Add your first stock above!
          </p>
        </div>
      )}

      {/* Tip */}
      {tickers.length > 1 && (
        <p className="text-gray-500 text-sm mt-6 text-center">
          Tip: Drag tickers to reorder. Higher priority stocks appear first in your digest.
        </p>
      )}
    </section>
  )
}
