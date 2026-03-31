'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Truck, ShieldAlert, HelpCircle } from 'lucide-react'
import { useLang } from '@/lib/LangContext'

interface Props {
  portId: string
  onSubmitted: () => void
}

export function ReportForm({ portId, onSubmitted }: Props) {
  const { t } = useLang()
  const [selected, setSelected] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const REPORT_TYPES = [
    { value: 'delay',      label: t.reportLong,       icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' },
    { value: 'inspection', label: t.reportInspection,  icon: ShieldAlert,   color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
    { value: 'accident',   label: t.reportAccident,    icon: Truck,         color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' },
    { value: 'clear',      label: t.reportClear,       icon: CheckCircle,   color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' },
    { value: 'other',      label: t.reportOther,       icon: HelpCircle,    color: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600' },
  ]

  async function submit() {
    if (!selected) return
    setSubmitting(true)
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portId,
          reportType: selected,
          description,
          severity: selected === 'accident' ? 'high' : selected === 'delay' ? 'medium' : 'low',
        }),
      })
      setDone(true)
      setTimeout(() => {
        setDone(false)
        setSelected(null)
        setDescription('')
        onSubmitted()
      }, 2000)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-green-600 font-medium text-sm">
        <CheckCircle className="w-4 h-4" /> {t.reportDone}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">{t.reportTitle}</p>

      <div className="grid grid-cols-3 gap-2">
        {REPORT_TYPES.slice(0, 3).map(({ value, label, icon: Icon, color }) => (
          <button
            key={value}
            onClick={() => setSelected(value === selected ? null : value)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${
              selected === value ? color + ' ring-2 ring-offset-1 ring-current' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {REPORT_TYPES.slice(3).map(({ value, label, icon: Icon, color }) => (
          <button
            key={value}
            onClick={() => setSelected(value === selected ? null : value)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${
              selected === value ? color + ' ring-2 ring-offset-1 ring-current' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {selected && (
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t.reportPlaceholder}
          className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          maxLength={500}
        />
      )}

      <button
        onClick={submit}
        disabled={!selected || submitting}
        className="w-full bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-40 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
      >
        {submitting ? t.reportSubmitting : t.reportSubmit}
      </button>
      <p className="text-center text-xs text-gray-400">No account needed · Sin cuenta necesaria</p>
    </div>
  )
}
