'use client'

import { getWaitLevel, waitLevelColor } from '@/lib/cbp'
import { useLang } from '@/lib/LangContext'

interface Props {
  minutes: number | null
  label: string
  lanesOpen?: number | null
}

export function WaitBadge({ minutes, label, lanesOpen }: Props) {
  const { t, lang } = useLang()
  const level = getWaitLevel(minutes)
  const colors = waitLevelColor(level)

  const display =
    minutes === null ? '—' :
    minutes === 0 ? t.lessThanMin :
    `${minutes} min`

  const lanesLabel = lanesOpen != null && lanesOpen > 0
    ? lang === 'es'
      ? `${lanesOpen} ${lanesOpen === 1 ? 'carril' : 'carriles'}`
      : `${lanesOpen} ${lanesOpen === 1 ? 'lane' : 'lanes'}`
    : null

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className={`text-sm font-bold px-2 py-1 rounded-full border ${colors}`}>
        {display}
      </span>
      {lanesLabel && (
        <span className="text-xs text-gray-400 dark:text-gray-500">{lanesLabel}</span>
      )}
    </div>
  )
}
