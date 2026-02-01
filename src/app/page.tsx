import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Stock Summaries</span>
          </div>
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all border border-white/20"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-purple-300 text-sm font-medium">Powered by Grok AI</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Cut through the noise.
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Get the signal.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered stock digests delivered to your inbox. No fluff, no speculation—just the facts that move markets, personalized to your watchlist.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              See How It Works
            </a>
          </div>

          {/* Social Proof */}
          <p className="text-gray-500 text-sm mt-8">
            No credit card required • Cancel anytime
          </p>
        </div>

        {/* Hero Visual */}
        <div className="max-w-4xl mx-auto mt-16 px-4">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>

            {/* Email Preview Card */}
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Email Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm">Your Daily Stock Digest</span>
              </div>

              {/* Email Content Preview */}
              <div className="p-6 space-y-4">
                {/* Stock Card 1 */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white">NVDA</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">Bullish</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">$892.50</span>
                      <span className="block text-green-400 text-sm">+3.2%</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Record data center revenue up 154% YoY. Jensen Huang announced new Blackwell architecture at GTC. Analysts raise targets across the board.
                  </p>
                </div>

                {/* Stock Card 2 */}
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white">AAPL</span>
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded-full">Neutral</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">$178.25</span>
                      <span className="block text-red-400 text-sm">-0.8%</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    EU DMA compliance deadline approaching. Vision Pro sales steady but below expectations. Services segment continues strong growth.
                  </p>
                </div>

                {/* More indicator */}
                <div className="text-center text-gray-500 text-sm pt-2">
                  + 3 more stocks in your digest
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Three simple steps to never miss a market-moving event again
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 text-white text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Build Your Watchlist</h3>
                <p className="text-gray-400">
                  Add the stock tickers you care about most. Drag to prioritize—your top picks come first in every digest.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 text-white text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Set Your Schedule</h3>
                <p className="text-gray-400">
                  Choose daily, weekly, or custom delivery. Pick your preferred time and timezone. We handle the rest.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 text-white text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Get Your Digest</h3>
                <p className="text-gray-400">
                  Receive beautiful, AI-curated summaries with price action, key events, insider moves, and what actually matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What You Get
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to stay informed, nothing you don&apos;t
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: 'Price Action',
                description: 'Current price, daily change, week-to-date, month-to-date at a glance.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                ),
                title: 'Key Events',
                description: 'Earnings, guidance changes, product launches, regulatory news.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Insider Activity',
                description: 'Significant insider buys and sells with names and amounts.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Analyst Actions',
                description: 'Upgrades, downgrades, and price target changes that matter.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Competitive Intel',
                description: 'Market share shifts and competitor moves affecting your stocks.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Upcoming Catalysts',
                description: 'Earnings dates, FDA decisions, product releases on your radar.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all group"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 text-purple-400 group-hover:bg-purple-500/30 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur-3xl"></div>

            <div className="relative bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-purple-500/30 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to cut through the noise?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of investors who start their day with clarity, not chaos.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-white font-semibold">Stock Summaries</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Stock Summaries. All rights reserved.
            </p>
          </div>
          <p className="text-gray-600 text-xs text-center mt-6">
            Not financial advice. Always do your own research before investing.
          </p>
        </div>
      </footer>
    </div>
  )
}
