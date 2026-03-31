'use client'

import { PortList } from '@/components/PortList'
import { NavBar } from '@/components/NavBar'
import { HomeReportsFeed } from '@/components/HomeReportsFeed'
import { WaitingMode } from '@/components/WaitingMode'
import { BusinessCommandWidget } from '@/components/BusinessCommandWidget'
import { ExchangeRateWidget } from '@/components/ExchangeRateWidget'
import { useLang } from '@/lib/LangContext'

export default function HomePage() {
  const { t } = useLang()

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-lg mx-auto px-4 pb-10">
        <div className="pt-8 pb-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🌉 {t.appName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.subtitle}</p>
          </div>
          <NavBar />
        </div>

        {/* Business Command Center — visible only to business tier */}
        <BusinessCommandWidget />

        {/* Geolocation — shows if user is near a crossing */}
        <WaitingMode />

        {/* Exchange rate */}
        <ExchangeRateWidget />

        <PortList />

        {/* Community reports feed */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t.recentReports}</h2>
          <HomeReportsFeed />
        </div>
      </div>
    </main>
  )
}
