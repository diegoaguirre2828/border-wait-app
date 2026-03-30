'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useTier } from '@/lib/useTier'

const RATINGS = [
  { value: 'fast',   emoji: '🟢', label: 'Fast',   labelEs: 'Rápido'   },
  { value: 'normal', emoji: '🟡', label: 'Normal',  labelEs: 'Normal'   },
  { value: 'slow',   emoji: '🔴', label: 'Slow',    labelEs: 'Lento'    },
]

interface Props {
  portId: string
  portName: string
  onSubmitted: () => void
}

export function JustCrossedPrompt({ portId, portName, onSubmitted }: Props) {
  const { user } = useAuth()
  const { tier } = useTier()
  const [show, setShow] = useState(false)
  const [step, setStep] = useState<'ask' | 'rate' | 'done'>('ask')
  const [actualMinutes, setActualMinutes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Show prompt after 45 seconds on page — user likely just crossed or is waiting
  useEffect(() => {
    if (!user) return
    const key = `crossed_${portId}_${new Date().toDateString()}`
    if (sessionStorage.getItem(key)) return // already asked today for this port

    const timer = setTimeout(() => setShow(true), 45000)
    return () => clearTimeout(timer)
  }, [user, portId])

  async function handleRating(rating: string) {
    setSubmitting(true)
    const minutes = actualMinutes ? parseInt(actualMinutes) : null
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portId,
        condition: rating,
        waitMinutes: minutes,
        note: `Reported via Just Crossed prompt`,
      }),
    })
    const key = `crossed_${portId}_${new Date().toDateString()}`
    sessionStorage.setItem(key, '1')
    setStep('done')
    setSubmitting(false)
    setTimeout(() => {
      setShow(false)
      onSubmitted()
    }, 1500)
  }

  function dismiss() {
    const key = `crossed_${portId}_${new Date().toDateString()}`
    sessionStorage.setItem(key, 'dismissed')
    setShow(false)
  }

  if (!show || !user) return null

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 z-50 flex justify-center">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-xl p-4">
        {step === 'ask' && (
          <>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Did you just cross at {portName}?
            </p>
            <p className="text-xs text-gray-500 mb-3">
              ¿Acabas de cruzar? Help others with real data.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('rate')}
                className="flex-1 bg-gray-900 text-white text-sm font-medium py-2 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Yes, I crossed
              </button>
              <button
                onClick={dismiss}
                className="px-4 text-sm text-gray-400 hover:text-gray-600"
              >
                No
              </button>
            </div>
          </>
        )}

        {step === 'rate' && (
          <>
            <p className="text-sm font-semibold text-gray-900 mb-3">How was it?</p>
            <div className="flex gap-2 mb-3">
              {RATINGS.map(r => (
                <button
                  key={r.value}
                  onClick={() => handleRating(r.value)}
                  disabled={submitting}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <span className="text-xl">{r.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{r.label}</span>
                  <span className="text-xs text-gray-400">{r.labelEs}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={actualMinutes}
                onChange={e => setActualMinutes(e.target.value)}
                placeholder="Actual minutes (optional)"
                min={1} max={300}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-2">
            <p className="text-2xl mb-1">🙌</p>
            <p className="text-sm font-semibold text-gray-900">Thanks for the report!</p>
            <p className="text-xs text-gray-500">¡Gracias! You're helping fellow crossers.</p>
          </div>
        )}
      </div>
    </div>
  )
}
