'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Truck, ShieldAlert, HelpCircle, Clock } from 'lucide-react'

const TYPE_CONFIG: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  delay:      { label: 'Long Delay',   icon: AlertTriangle, color: 'text-yellow-600' },
  inspection: { label: 'Inspection',   icon: ShieldAlert,   color: 'text-blue-600' },
  accident:   { label: 'Accident',     icon: Truck,         color: 'text-red-600' },
  clear:      { label: 'Moving Fast',  icon: CheckCircle,   color: 'text-green-600' },
  other:      { label: 'Update',       icon: HelpCircle,    color: 'text-gray-500' },
}

interface Report {
  id: string
  report_type: string
  description: string | null
  severity: string
  upvotes: number
  created_at: string
}

interface Props {
  portId: string
  refresh: number
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.round(mins / 60)}h ago`
}

export function ReportsFeed({ portId, refresh }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reports?portId=${encodeURIComponent(portId)}`)
      .then(r => r.json())
      .then(d => setReports(d.reports || []))
      .finally(() => setLoading(false))
  }, [portId, refresh])

  if (loading) return <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />

  if (reports.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-3">
        No reports in the last 12 hours. Be the first to report!
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {reports.map(r => {
        const config = TYPE_CONFIG[r.report_type] ?? TYPE_CONFIG.other
        const Icon = config.icon
        return (
          <div key={r.id} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />{timeAgo(r.created_at)}
                </span>
              </div>
              {r.description && (
                <p className="text-xs text-gray-600 mt-0.5">{r.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
