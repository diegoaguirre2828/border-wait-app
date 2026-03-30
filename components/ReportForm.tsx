'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Truck, ShieldAlert, HelpCircle } from 'lucide-react'

const REPORT_TYPES = [
  { value: 'delay',      label: 'Long Delay',    icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { value: 'inspection', label: 'Inspection',    icon: ShieldAlert,   color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'accident',   label: 'Accident',      icon: Truck,         color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'clear',      label: 'Moving Fast',   icon: CheckCircle,   color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'other',      label: 'Other',         icon: HelpCircle,    color: 'text-gray-600 bg-gray-50 border-gray-200' },
]

interface Props {
  portId: string
  onSubmitted: () => void
}

export function ReportForm({ portId, onSubmitted }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

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
        <CheckCircle className="w-4 h-4" /> Report submitted — thanks!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">What&apos;s happening at this crossing right now?</p>

      <div className="grid grid-cols-3 gap-2">
        {REPORT_TYPES.map(({ value, label, icon: Icon, color }) => (
          <button
            key={value}
            onClick={() => setSelected(value === selected ? null : value)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${
              selected === value ? color + ' ring-2 ring-offset-1 ring-current' : 'border-gray-200 text-gray-500 bg-white'
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
          placeholder="Optional details (lane number, cause, etc.)"
          className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          maxLength={500}
        />
      )}

      <button
        onClick={submit}
        disabled={!selected || submitting}
        className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-40 hover:bg-gray-700 transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </div>
  )
}
