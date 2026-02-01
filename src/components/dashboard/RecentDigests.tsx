'use client'

import type { Digest } from '@/lib/types'

interface RecentDigestsProps {
  digests: Digest[]
}

export default function RecentDigests({ digests }: RecentDigestsProps) {
  if (digests.length === 0) {
    return (
      <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">Recent Digests</h2>
          <p className="text-gray-400 text-sm mt-1">
            Your past email summaries
          </p>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400">
            No digests yet. Add some tickers and set your schedule!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Recent Digests</h2>
        <p className="text-gray-400 text-sm mt-1">
          Your past email summaries
        </p>
      </div>

      <div className="space-y-4">
        {digests.map((digest) => (
          <div
            key={digest.id}
            className="group p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex -space-x-1">
                    {digest.tickers.slice(0, 3).map((ticker) => (
                      <span
                        key={ticker}
                        className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg text-xs font-bold text-white border-2 border-slate-900"
                      >
                        {ticker.slice(0, 2)}
                      </span>
                    ))}
                    {digest.tickers.length > 3 && (
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-white/10 rounded-lg text-xs font-medium text-gray-400 border-2 border-slate-900">
                        +{digest.tickers.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-medium">
                    {digest.tickers.slice(0, 3).join(', ')}
                    {digest.tickers.length > 3 && ` +${digest.tickers.length - 3}`}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {digest.content.slice(0, 150)}...
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-gray-500 text-sm">
                  {new Date(digest.sent_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-600 text-xs">
                  {new Date(digest.sent_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
