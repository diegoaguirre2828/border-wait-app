'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, ThumbsUp, MessageSquare } from 'lucide-react'
import { useLang } from '@/lib/LangContext'

interface Report {
  id: string
  port_id: string
  report_type: string
  description: string | null
  wait_minutes: number | null
  upvotes: number
  created_at: string
  username: string | null
}

const TYPE_EMOJI: Record<string, string> = {
  delay: '🔴', inspection: '🔵', accident: '⚠️', clear: '🟢', other: '⚪',
}
const TYPE_LABEL_ES: Record<string, string> = {
  delay: 'Demora', inspection: 'Inspección', accident: 'Accidente', clear: 'Fluye rápido', other: 'Actualización',
}
const TYPE_LABEL_EN: Record<string, string> = {
  delay: 'Delay', inspection: 'Inspection', accident: 'Accident', clear: 'Moving Fast', other: 'Update',
}

function timeAgo(iso: string, lang: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return lang === 'es' ? 'ahora' : 'now'
  if (mins < 60) return lang === 'es' ? `${mins}m` : `${mins}m ago`
  return lang === 'es' ? `${Math.round(mins / 60)}h` : `${Math.round(mins / 60)}h ago`
}

export function HomeReportsFeed() {
  const { t, lang } = useLang()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports/recent')
      .then(r => r.json())
      .then(d => setReports(d.reports || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-2">
      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
    </div>
  )

  if (reports.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <MessageSquare className="w-6 h-6 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-400">{t.noReports}</p>
        <p className="text-xs text-gray-400 mt-0.5">{t.beFirst}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {reports.map(r => (
        <Link key={r.id} href={`/port/${encodeURIComponent(r.port_id)}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className="text-xl flex-shrink-0">{TYPE_EMOJI[r.report_type] ?? '⚪'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {lang === 'es' ? TYPE_LABEL_ES[r.report_type] : TYPE_LABEL_EN[r.report_type]}
                </span>
                {r.wait_minutes !== null && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold px-1.5 py-0.5 rounded-full">
                    {r.wait_minutes}m
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {r.username ? `@${r.username}` : t.anonymous}
                {r.description && r.description !== 'Reported via Just Crossed prompt' && ` · ${r.description}`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />{timeAgo(r.created_at, lang)}
              </span>
              {r.upvotes > 0 && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />{r.upvotes}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
